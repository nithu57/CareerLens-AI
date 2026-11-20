import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Firebase Web Configuration from environment variables
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'careerlens-ai-8beae.firebaseapp.com').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'careerLens-ai-8beae').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'careerlens-ai-8beae.firebasestorage.app').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID.trim() }
    : {}),
};

/**
 * Validates whether the current Firebase configuration contains real, valid credentials
 * rather than missing, default, or placeholder values (e.g. YOUR_ACTUAL_API_KEY).
 */
export function isFirebaseConfigured(): boolean {
  const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
  const appId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();

  // A genuine Google Cloud/Firebase Web API key starts with "AIzaSy" and is ~39 characters long
  const isPlaceholderApiKey =
    !apiKey ||
    apiKey === 'YOUR_ACTUAL_API_KEY' ||
    apiKey.includes('YOUR_') ||
    apiKey.includes('ExampleKey') ||
    apiKey.includes('Placeholder') ||
    apiKey.includes('placeholder') ||
    !apiKey.startsWith('AIza') ||
    apiKey.length < 30;

  // A genuine Firebase Web App ID follows the format "1:<sender_id>:web:<app_hex>"
  const isPlaceholderAppId =
    !appId ||
    appId === 'YOUR_ACTUAL_APP_ID' ||
    appId.includes('YOUR_') ||
    appId.includes('placeholder') ||
    appId === '1:123456789012:web:abcdef1234567890' ||
    !appId.startsWith('1:');

  if (isPlaceholderApiKey || isPlaceholderAppId) {
    return false;
  }
  return true;
}

// Singleton Firebase initialization
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with ignoreUndefinedProperties to handle optional TypeScript properties gracefully
let db: Firestore;
try {
  db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });
} catch {
  db = getFirestore(app);
}
export { db };

export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(
  app,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1'
);

// Optional Google Analytics initialization
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

export default app;
