import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getAdminApp(): App {
  // Check if Firebase Admin SDK environment variables are set
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      'Firebase Admin SDK environment variables are not set. ' +
      'Please check FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID in your .env.local file.'
    );
  }

  // Parse private key - handle both literal \n and actual newlines
  let parsedKey: string;
  try {
    // First, try to parse as JSON (in case it's a JSON string)
    parsedKey = JSON.parse(privateKey);
  } catch {
    // If not JSON, replace literal \n with actual newlines
    parsedKey = privateKey.replace(/\\n/g, '\n');
  }

  // Only initialize if not already initialized
  if (!getApps().length) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: parsedKey,
        }),
      });
      console.log('[Firebase Admin] Initialized successfully');
    } catch (error: any) {
      console.error('[Firebase Admin] Initialization failed:', error.message);
      throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export { getAdminApp };
