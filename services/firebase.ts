import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants';

// Initialize Firebase defensively: with missing/invalid config (e.g. dev
// placeholders) the app should still render instead of white-screening.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

try {
  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getDatabase(app);
} catch (e) {
  console.warn('Firebase initialization failed — running without Firebase:', e);
}

export { auth, db };
