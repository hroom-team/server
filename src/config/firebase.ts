import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrshtX9K8EYYyewiPVcT7TZ05K-whJxNY",
  authDomain: "hroom-mpv-2f31e.firebaseapp.com",
  projectId: "hroom-mpv-2f31e",
  storageBucket: "hroom-mpv-2f31e.firebasestorage.app",
  messagingSenderId: "356587190634",
  appId: "1:356587190634:web:f7759be737658700830d13"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);