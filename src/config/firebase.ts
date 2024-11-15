import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK at the global scope
admin.initializeApp();

// Export the admin instance
export default admin;

// Export Firestore instance
export const db = admin.firestore();