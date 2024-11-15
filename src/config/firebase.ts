import * as admin from 'firebase-admin';
import { getEnvVar } from './env';

export const firebaseConfig = {
  apiKey: "AIzaSyBrshtX9K8EYYyewiPVcT7TZ05K-whJxNY",
  authDomain: "hroom-mpv-2f31e.firebaseapp.com",
  projectId: "hroom-mpv-2f31e",
  storageBucket: "hroom-mpv-2f31e.firebasestorage.app",
  messagingSenderId: "356587190634",
  appId: "1:356587190634:web:f7759be737658700830d13"
};

export const initializeFirebase = (): void => {
  const privateKey = getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.projectId,
      clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
      privateKey,
    }),
  });
};