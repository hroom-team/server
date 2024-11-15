import * as admin from 'firebase-admin';
import { getEnvVar } from './env';

const serviceAccount = {
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Export the admin instance
export default admin;

// Export Firestore instance
export const db = admin.firestore();