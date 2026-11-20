import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleAuthProvider, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { getUserProfile, saveUserProfile, subscribeUserProfile } from '@/services/userService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateLocalProfile: (updates: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = useMemo(() => isFirebaseConfigured(), []);

  // Ensure Firebase is properly configured before invoking network calls
  const ensureConfigured = () => {
    if (!isConfigured) {
      const err: any = new Error(
        'Firebase web credentials are not configured. Please add your actual VITE_FIREBASE_API_KEY from Firebase Console to .env.local.'
      );
      err.code = 'auth/api-key-not-valid-please-pass-a-valid-api-key';
      throw err;
    }
  };

  // Listen to Firebase Auth state only when genuine credentials exist
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        if (user) {
          // Sync authenticated user to shared MERN MongoDB backend
          try {
            const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001';
            fetch(`${backendBaseUrl}/api/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebaseUid: user.uid,
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                name: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL || '',
                profileImage: user.photoURL || '',
              }),
            }).catch((err) => console.warn('MongoDB user sync notice:', err));
          } catch (e) {}

          const cachedKey = `careerlens_profile_${user.uid}`;
          const completedKey = `careerlens_onboarding_completed_${user.uid}`;
          let cachedProfile: UserProfile | null = null;
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              const raw = window.localStorage.getItem(cachedKey);
              if (raw) {
                cachedProfile = JSON.parse(raw);
                setUserProfile(cachedProfile);
              }
            } catch (e) {
              console.warn('Could not read cached profile:', e);
            }
          }

          // Subscribe to user profile in Firestore with offline resilience
          unsubscribeProfile = subscribeUserProfile(
            user.uid,
            (profile) => {
              const isDoneLocally = typeof window !== 'undefined' && window.localStorage?.getItem(completedKey) === 'true';
              if (profile) {
                const isCompleted = profile.onboardingCompleted || isDoneLocally || cachedProfile?.onboardingCompleted || false;
                const merged: UserProfile = {
                  ...cachedProfile,
                  ...profile,
                  onboardingCompleted: isCompleted,
                };
                setUserProfile(merged);
                if (typeof window !== 'undefined' && window.localStorage) {
                  try {
                    window.localStorage.setItem(cachedKey, JSON.stringify(merged));
                    if (isCompleted) {
                      window.localStorage.setItem(completedKey, 'true');
                    }
                  } catch (e) {}
                }
              } else {
                // Profile document does not exist yet (e.g. brand new user)
                const isCompleted = isDoneLocally || cachedProfile?.onboardingCompleted || false;
                const initialProfile: UserProfile = cachedProfile || {
                  uid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || user.email?.split('@')[0] || 'Member',
                  photoURL: user.photoURL,
                  onboardingCompleted: isCompleted,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                saveUserProfile(initialProfile).catch((e) =>
                  console.warn('Initial profile sync warning (offline or database unprovisioned):', e)
                );
                setUserProfile(initialProfile);
                if (typeof window !== 'undefined' && window.localStorage) {
                  try {
                    window.localStorage.setItem(cachedKey, JSON.stringify(initialProfile));
                    if (isCompleted) {
                      window.localStorage.setItem(completedKey, 'true');
                    }
                  } catch (e) {}
                }
              }
              setLoading(false);
            },
            (profileErr) => {
              console.warn('Firestore profile subscription warning (falling back to session profile):', profileErr);
              const isDoneLocally = typeof window !== 'undefined' && window.localStorage?.getItem(completedKey) === 'true';
              const isCompleted = isDoneLocally || cachedProfile?.onboardingCompleted || false;
              // Fallback to in-memory/cached profile so the app is not blocked and doesn't lose onboarding status
              const fallbackProfile: UserProfile = cachedProfile || {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Member',
                photoURL: user.photoURL,
                onboardingCompleted: isCompleted,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUserProfile(fallbackProfile);
              setLoading(false);
            }
          );
        } else {
          if (unsubscribeProfile) unsubscribeProfile();
          setUserProfile(null);
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Firebase Auth state listener error:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [isConfigured]);

  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    ensureConfigured();

    // 1. Create Firebase Authentication account first
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, pass);
    } catch (authErr: any) {
      throw authErr;
    }

    // 2. Prepare user profile
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: displayName.trim() || email.split('@')[0],
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Write user profile to Firestore with atomic rollback on failure
    try {
      await saveUserProfile(newProfile);
      setUserProfile(newProfile);
    } catch (firestoreErr: any) {
      console.error('Failed to create user profile in Firestore:', firestoreErr);

      // Rollback orphaned auth user so user is not stuck with an unrecoverable account
      try {
        await cred.user.delete();
      } catch (rollbackErr) {
        console.warn('Could not roll back orphaned auth user:', rollbackErr);
      }

      const isOfflineOrUnavailable =
        firestoreErr.code === 'unavailable' ||
        (firestoreErr.message && (
          firestoreErr.message.includes('offline') ||
          firestoreErr.message.includes('client is offline') ||
          firestoreErr.message.includes('unavailable') ||
          firestoreErr.message.includes('404')
        ));

      if (isOfflineOrUnavailable) {
        const customError: any = new Error(
          'Cloud Firestore database is unreachable or not yet created. In Firebase Console, open "Firestore Database" and click "Create database" (in production mode).'
        );
        customError.code = 'firestore/database-unavailable';
        throw customError;
      } else if (firestoreErr.code === 'permission-denied') {
        const customError: any = new Error(
          'Firestore permission denied. Please verify your Firestore Security Rules permit user profile creation.'
        );
        customError.code = 'firestore/permission-denied';
        throw customError;
      } else {
        throw firestoreErr;
      }
    }

    // Optional email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Could not send verification email:', e);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    ensureConfigured();
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    ensureConfigured();
    const result = await signInWithPopup(auth, googleAuthProvider);
    let existing: UserProfile | null = null;
    try {
      existing = await getUserProfile(result.user.uid);
    } catch (readErr) {
      console.warn('Could not check existing profile:', readErr);
    }

    if (!existing) {
      const newProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Member',
        photoURL: result.user.photoURL,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await saveUserProfile(newProfile);
      } catch (writeErr) {
        console.warn('Could not write Google user profile to Firestore:', writeErr);
      }
      setUserProfile(newProfile);
    } else {
      setUserProfile(existing);
    }
  };

  const logout = async () => {
    if (!isConfigured) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    ensureConfigured();
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    ensureConfigured();
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) setUserProfile(profile);
      } catch (err) {
        console.warn('Could not refresh profile:', err);
      }
    }
  };

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const isCompleted = updates.onboardingCompleted ?? prev?.onboardingCompleted ?? false;
      const merged = {
        ...(prev || {
          uid: currentUser?.uid || '',
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || 'Member',
        }),
        ...updates,
        onboardingCompleted: isCompleted,
      } as UserProfile;

      if (currentUser?.uid && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(`careerlens_profile_${currentUser.uid}`, JSON.stringify(merged));
          if (isCompleted) {
            window.localStorage.setItem(`careerlens_onboarding_completed_${currentUser.uid}`, 'true');
          }
        } catch (e) {}
      }

      return merged;
    });
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    isConfigured,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    resendVerificationEmail,
    refreshProfile,
    updateLocalProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
