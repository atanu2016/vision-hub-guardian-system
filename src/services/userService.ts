
// Re-export functions from firebaseService to maintain the same interface
export { 
  fetchUsers, 
  updateUserRole, 
  toggleMfaRequirement, 
  checkMigrationAccess 
} from './firebaseService';
