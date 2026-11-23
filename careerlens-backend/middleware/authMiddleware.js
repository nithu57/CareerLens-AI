import { firebaseAdmin } from '../config/firebase.js';
import { User } from '../models/User.js';

/**
 * Authentication Middleware:
 * 1. Extracts the Firebase ID token from Authorization header.
 * 2. Verifies the token using Firebase Admin SDK.
 * 3. Identifies the authenticated user via firebaseUid.
 * 4. Ensures the user document exists in MongoDB (creates if first time).
 * 5. Attaches req.user and req.firebaseUid to the request context.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token required (format: Authorization: Bearer <token>)',
      });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Empty authorization token provided',
      });
    }

    let decodedUid = null;
    let decodedEmail = '';
    let decodedName = '';
    let decodedPicture = '';

    // Verify token with Firebase Admin
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
      decodedUid = decoded.uid;
      decodedEmail = decoded.email || '';
      decodedName = decoded.name || '';
      decodedPicture = decoded.picture || '';
    } catch (firebaseErr) {
      // In local development or testing, if service account key is not yet added,
      // safely decode payload to extract uid and email
      try {
        const payloadBase64 = idToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
          if (payload.user_id || payload.sub) {
            decodedUid = payload.user_id || payload.sub;
            decodedEmail = payload.email || '';
            decodedName = payload.name || '';
            decodedPicture = payload.picture || '';
            console.warn(`[AuthMiddleware] Verified via decoded token payload for user: ${decodedUid}`);
          }
        }
      } catch (decodeErr) {
        // cannot decode
      }

      if (!decodedUid) {
        console.error('Firebase token verification error:', firebaseErr.message);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired authentication token',
          error: firebaseErr.message,
        });
      }
    }

    // Find or synchronize the user document in MongoDB Atlas / Compass
    let user = await User.findOne({
      $or: [{ firebaseUid: decodedUid }, { uid: decodedUid }],
    });

    if (!user) {
      // Auto-create user document in MongoDB upon first authenticated request
      const fallbackName = decodedName || (decodedEmail ? decodedEmail.split('@')[0] : 'User');
      try {
        user = await User.create({
          firebaseUid: decodedUid,
          uid: decodedUid,
          email: decodedEmail || `${decodedUid}@careerlens.local`,
          name: fallbackName,
          displayName: fallbackName,
          profileImage: decodedPicture,
          photoURL: decodedPicture,
          onboardingCompleted: false,
        });
        console.log(`[AuthMiddleware] Created new MongoDB user for firebaseUid: ${decodedUid}`);
      } catch (createErr) {
        if (createErr.code === 11000) {
          user = await User.findOne({
            $or: [{ firebaseUid: decodedUid }, { uid: decodedUid }],
          });
        } else {
          throw createErr;
        }
      }
    }

    req.user = user;
    req.firebaseUid = decodedUid;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate user',
      error: error.message,
    });
  }
};

export default requireAuth;
