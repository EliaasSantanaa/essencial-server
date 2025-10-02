import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const parseServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decodedServiceAccount = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64',
    ).toString('utf-8');
    return JSON.parse(decodedServiceAccount);
  } else {
    return require('./service-account.json');
  }
};

admin.initializeApp({
  credential: admin.credential.cert(parseServiceAccount()),
});

const db = getFirestore();

export const firebaseAdmin = admin;
export const firestoreDb = db;