import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import appletConfig from '../firebase-applet-config.json';

// Support environment variables for production (Netlify)
// Fallback to appletConfig if environment variables are not provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Dummy exports to prevent breaking existing imports
export const db = {};
export const storage = {};
