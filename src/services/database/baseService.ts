
// Base service with common database utility functions

/**
 * Log database errors with a standardized format
 */
export const logDatabaseError = (error: any, message: string) => {
  console.error(`Database Error: ${message}`, error);
  return new Error(`${message}: ${error?.message || 'Unknown error'}`);
};

/**
 * Safely get nested properties from an object without throwing errors
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) return defaultValue;
      result = result[key];
    }
    
    return (result === undefined || result === null) ? defaultValue : result as T;
  } catch (error) {
    return defaultValue;
  }
};
