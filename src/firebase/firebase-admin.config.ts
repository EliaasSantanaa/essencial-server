import * as admin from 'firebase-admin';
import * as serviceAccount from './service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // Use credenciais padrão ou configure manualmente
});

export const firebaseAdmin = admin;
