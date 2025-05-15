
import { toast } from 'sonner';
import { 
  fetchUsers as fetchFirebaseUsers, 
  updateUserRole as updateFirebaseUserRole, 
  toggleMfaRequirement as toggleFirebaseMfaRequirement, 
  checkMigrationAccess as checkFirebaseMigrationAccess 
} from './firebaseService';

// Re-export functions from firebaseService to maintain the same interface
export { 
  updateUserRole, 
  toggleMfaRequirement, 
  checkMigrationAccess 
};

// Create a local admin flag to bypass Firebase during development
let localAdminCreated = false;
const localAdmin = {
  id: 'local-admin-id',
  email: 'admin@example.com',
  full_name: 'Local Admin',
  role: 'superadmin',
  mfa_enrolled: false,
  mfa_required: false,
  created_at: new Date().toISOString()
};

// Modified fetchUsers function that returns local admin when Firebase fails
export async function fetchUsers() {
  try {
    console.log("Attempting to fetch users from Firebase...");
    return await fetchFirebaseUsers();
  } catch (error) {
    console.error('Error fetching users from Firebase:', error);
    toast.error('Using local admin account due to Firebase connection issues');
    
    // Return local admin account as a fallback
    return [localAdmin];
  }
}

// Helper function to check if the local admin login is valid
export function checkLocalAdminLogin(email: string, password: string): boolean {
  // For development only - use a simple password
  return (email === 'admin@example.com' && password === 'admin123');
}

// Create local admin account for development
export function createLocalAdmin(): void {
  localAdminCreated = true;
  toast.success('Local admin account created successfully');
}

// Check if the local admin was created
export function isLocalAdminCreated(): boolean {
  return localAdminCreated;
}
