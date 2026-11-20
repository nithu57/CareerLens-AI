import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { UserProfile } from '@/types';

const USERS_COLLECTION = 'users';

/**
 * Safely fetches a user profile document from Firestore.
 * Handles offline / network unavailable states gracefully without crashing the app.
 * Includes a 4-second timeout to ensure the app never hangs on slow or offline connections.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;

  // Check localStorage first for instant, offline-resilient access
  let cached: UserProfile | null = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`careerlens_profile_${uid}`);
      if (raw) {
        cached = JSON.parse(raw) as UserProfile;
      }
    } catch (e) {
      console.warn('Error reading cached user profile:', e);
    }
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await Promise.race([
      getDoc(userDocRef),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore profile fetch timed out')), 4000)
      ),
    ]);
    if (!snap.exists()) {
      return cached;
    }
    const data = snap.data() as UserProfile;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const isDone = data.onboardingCompleted || cached?.onboardingCompleted || false;
        const merged = { ...cached, ...data, onboardingCompleted: isDone };
        window.localStorage.setItem(`careerlens_profile_${uid}`, JSON.stringify(merged));
        if (isDone) {
          window.localStorage.setItem(`careerlens_onboarding_completed_${uid}`, 'true');
        }
        return merged;
      } catch (e) {}
    }
    return data;
  } catch (err: any) {
    console.warn('Unable to get user profile from Firestore (client may be offline or database not yet provisioned):', err);
    return cached;
  }
}

/**
 * Saves a user profile document in Firestore.
 * Cleans undefined values and handles timestamps.
 * Races with a 5-second timeout so slow/hung network requests never freeze the UI.
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!profile.uid) throw new Error('User UID is required');
  const userDocRef = doc(db, USERS_COLLECTION, profile.uid);
  const now = new Date().toISOString();

  // Clean undefined properties to prevent Firestore serialization errors
  const cleanProfile: Record<string, any> = {};
  for (const [key, value] of Object.entries(profile)) {
    if (value !== undefined) {
      cleanProfile[key] = value;
    }
  }

  const payload: Record<string, any> = {
    ...cleanProfile,
    updatedAt: now,
    createdAt: profile.createdAt || now,
  };

  // Immediate local cache persistence
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`careerlens_profile_${profile.uid}`, JSON.stringify(payload));
      if (payload.onboardingCompleted) {
        window.localStorage.setItem(`careerlens_onboarding_completed_${profile.uid}`, 'true');
      }
    } catch (e) {}
  }

  const setPromise = setDoc(userDocRef, payload, { merge: true });

  // Direct sync to shared MERN MongoDB backend
  try {
    const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001';
    fetch(`${backendBaseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: profile.uid,
        uid: profile.uid,
        ...payload,
      }),
    }).catch((e) => console.warn('Non-blocking MongoDB backend sync notice:', e));
  } catch (err) {
    // ignore
  }

  await Promise.race([
    setPromise,
    new Promise<void>((resolve) =>
      setTimeout(() => {
        console.warn('saveUserProfile: write acknowledged locally; network sync pending.');
        resolve();
      }, 5000)
    ),
  ]);
}

/**
 * Updates specific fields in an existing user profile document.
 * Uses setDoc with merge: true to safely handle profile updates and avoid
 * "No document to update" failures, while enforcing required fields and timestamps.
 * Races with a 5-second timeout so slow/hung network requests never freeze the UI.
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!uid) throw new Error('User UID is required');
  const userDocRef = doc(db, USERS_COLLECTION, uid);

  // Clean undefined values
  const cleanUpdates: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  }

  const now = new Date().toISOString();
  const payload = {
    uid,
    ...cleanUpdates,
    updatedAt: now,
  };

  // Immediate local cache persistence
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existingRaw = window.localStorage.getItem(`careerlens_profile_${uid}`);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const merged = { ...existing, ...payload };
      window.localStorage.setItem(`careerlens_profile_${uid}`, JSON.stringify(merged));
      if (merged.onboardingCompleted) {
        window.localStorage.setItem(`careerlens_onboarding_completed_${uid}`, 'true');
      }
    } catch (e) {}
  }

  const updatePromise = setDoc(userDocRef, payload, { merge: true });

  // Direct sync to shared MERN MongoDB backend
  try {
    const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001';
    fetch(`${backendBaseUrl}/api/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanUpdates),
    }).catch((e) => console.warn('Non-blocking MongoDB backend update notice:', e));
  } catch (err) {
    // ignore
  }

  await Promise.race([
    updatePromise,
    new Promise<void>((resolve) =>
      setTimeout(() => {
        console.warn('updateUserProfile: write acknowledged locally; network sync pending.');
        resolve();
      }, 5000)
    ),
  ]);
}

/**
 * Subscribes to real-time updates for a user profile document.
 * Calls onError or provides null fallback if Firestore connection drops or is offline.
 */
export function subscribeUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): () => void {
  if (!uid) {
    callback(null);
    return () => {};
  }
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Firestore user profile listener warning:', err);
      if (onError) {
        onError(err);
      } else {
        callback(null);
      }
    }
  );
}

/**
 * Complete user data deletion workflow:
 * Cleans up user document, all subcollections (analyses, saved jobs, resources, roadmap, chat history),
 * and uploaded resume files in Cloud Storage.
 */
export async function deleteUserData(uid: string): Promise<void> {
  if (!uid) return;

  const subcollections = [
    'resume_analyses',
    'job_analyses',
    'saved_jobs',
    'saved_resources',
    'roadmap',
    'chat_history',
  ];

  // 1. Delete all subcollection docs
  for (const subcol of subcollections) {
    try {
      const colRef = collection(db, USERS_COLLECTION, uid, subcol);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (colErr) {
      console.warn(`Subcollection cleanup warning for ${subcol}:`, colErr);
    }
  }

  // 2. Delete user profile doc
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userDocRef);
  } catch (docErr) {
    console.warn('User document delete warning:', docErr);
  }

  // 3. Delete files in Storage /resumes/{uid}
  try {
    const storageDirRef = ref(storage, `resumes/${uid}`);
    const filesList = await listAll(storageDirRef);
    await Promise.all(filesList.items.map((fileRef) => deleteObject(fileRef)));
  } catch (err) {
    console.warn('Storage cleanup non-fatal warning or empty directory:', err);
  }
}
