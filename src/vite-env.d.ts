
/// <reference types="vite/client" />

import { UserCredential, User as FirebaseUser } from "firebase/auth";

// Extend the Firebase User type with any custom properties if needed
declare module "firebase/auth" {
  interface User extends FirebaseUser {
    // Any custom properties would be defined here
  }
}

// Define environment variables
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
