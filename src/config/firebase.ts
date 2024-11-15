import * as admin from 'firebase-admin';
import { getEnvVar } from './env';

export const initializeFirebase = (): void => {
  try {
    if (admin.apps.length === 0) {
      const privateKey = getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: getEnvVar('FIREBASE_PROJECT_ID'),
          clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
          privateKey,
        }),
      });

      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};