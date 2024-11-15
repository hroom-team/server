import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = (): void => {
  try {
    if (admin.apps.length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY is not set');
      }

      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('FIREBASE_CLIENT_EMAIL is not set');
      }

      if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error('FIREBASE_PROJECT_ID is not set');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });

      logger.info('Firebase initialized successfully');
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }
};