
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these placeholder values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyYourActualApiKeyHere",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Console log for debugging on initialization
console.log("Firebase initialized with config:", { 
  apiKey: firebaseConfig.apiKey ? "Present (masked)" : "Missing", 
  projectId: firebaseConfig.projectId
});
