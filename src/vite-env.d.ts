
/// <reference types="vite/client" />

import { UserCredential, User as FirebaseUser } from "firebase/auth";

// Extend the Firebase User type with any custom properties if needed
declare module "firebase/auth" {
  interface User extends FirebaseUser {
    // Any custom properties would be defined here
  }
}
