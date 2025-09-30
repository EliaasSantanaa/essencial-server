import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore'; // 👈 1. Importe o getFirestore
import * as serviceAccount from './service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = getFirestore();

export const firebaseAdmin = admin;
export const firestoreDb = db;