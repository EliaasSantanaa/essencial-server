import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './service-account.json';

const serviceAccountObject = JSON.parse(JSON.stringify(serviceAccount));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountObject),
});

const db = getFirestore();

export const firebaseAdmin = admin;
export const firestoreDb = db;