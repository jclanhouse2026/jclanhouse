import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletConfig from '../firebase-applet-config.json';

// Support environment variables for production (Netlify)
// Fallback to appletConfig if environment variables are not provided
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId;

// Ensure storage bucket uses the correct format (some environments have issues with .firebasestorage.app)
let bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || (projectId ? `${projectId}.appspot.com` : '');
if (bucket && bucket.includes('.firebasestorage.app')) {
  bucket = bucket.replace('.firebasestorage.app', '.appspot.com');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  storageBucket: bucket
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (import.meta.env.VITE_FIREBASE_PROJECT_ID ? '(default)' : appletConfig.firestoreDatabaseId);
export const db = getFirestore(app, databaseId);
export const storage = getStorage(app);

