import * as admin from 'firebase-admin';

// Initialize Firebase Admin at the global scope
admin.initializeApp();

// Export the admin instance and database
export const db = admin.firestore();
export default admin;