import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import appletConfig from '../firebase-applet-config.json';

// Support environment variables for production (Netlify)
// Fallback to appletConfig if environment variables are not provided
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore and Storage are disabled to avoid quota issues.
// Exporting dummy objects to prevent breaking imports immediately, 
// but they should be removed from the code.
export const db = {} as any;
export const storage = {} as any;

