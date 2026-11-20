import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let firebaseApp = null;

export const initFirebaseAdmin = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'careerlens-ai-8beae';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    // 1. Check for serviceAccountKey.json in config folder
    const serviceAccountPath = path.resolve('config', 'serviceAccountKey.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
      });
      console.log('Firebase Admin SDK initialized using config/serviceAccountKey.json');
    } else if (clientEmail && privateKey) {
      // 2. Use environment variables
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized using environment credentials');
    } else {
      // 3. Fallback: Initialize with projectId for public token verification / local development
      firebaseApp = admin.initializeApp({
        projectId,
      });
      console.log(`Firebase Admin SDK initialized with project ID: ${projectId} (Public verification mode)`);
    }

    return firebaseApp;
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    return null;
  }
};

// Initialize on module load
initFirebaseAdmin();

export const firebaseAdmin = admin;
export default admin;
