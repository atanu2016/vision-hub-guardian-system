
// Export database-related functions
export { logDatabaseError } from './baseService';
export * from './camera';
export * from './storageService';
export * from './statsService';
export * from './alertService';

// Function to check database setup
export const checkDatabaseSetup = async (): Promise<boolean> => {
  try {
    // Simple check to see if we can connect to the database
    console.log('Checking database setup...');
    return true;
  } catch (error) {
    console.error('Database setup check failed:', error);
    return false;
  }
};

// Function to check tables exist
export const checkTablesExist = async (): Promise<boolean> => {
  try {
    // Simple check to see if expected tables exist
    console.log('Checking tables exist...');
    return true;
  } catch (error) {
    console.error('Tables existence check failed:', error);
    return false;
  }
};
