import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const firebaseConfig = {
  apiKey: "AIzaSyBrshtX9K8EYYyewiPVcT7TZ05K-whJxNY",
  authDomain: "hroom-mpv-2f31e.firebaseapp.com",
  projectId: "hroom-mpv-2f31e",
  storageBucket: "hroom-mpv-2f31e.firebasestorage.app",
  messagingSenderId: "356587190634",
  appId: "1:356587190634:web:f7759be737658700830d13"
};

export const initializeFirebase = (): void => {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set');
    }

    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('FIREBASE_CLIENT_EMAIL is not set');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });

    logger.info('Firebase initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }
};