
// Utility function to parse storage values and convert to GB
export const parseStorageValue = (value: string): number => {
  if (!value) return 0;
  
  const cleanValue = value.toLowerCase().trim();
  const numericValue = parseFloat(cleanValue);
  
  if (isNaN(numericValue)) return 0;
  
  // Convert to GB based on unit
  if (cleanValue.includes('tb')) {
    return numericValue * 1024; // TB to GB
  } else if (cleanValue.includes('gb')) {
    return numericValue; // Already in GB
  } else if (cleanValue.includes('mb')) {
    return numericValue / 1024; // MB to GB
  } else if (cleanValue.includes('kb')) {
    return numericValue / (1024 * 1024); // KB to GB
  }
  
  // Assume GB if no unit specified
  return numericValue;
};

// Format storage size for display
export const formatStorageSize = (sizeInGB: number): string => {
  if (sizeInGB >= 1024) {
    return `${(sizeInGB / 1024).toFixed(1)} TB`;
  } else if (sizeInGB >= 1) {
    return `${sizeInGB.toFixed(1)} GB`;
  } else {
    return `${(sizeInGB * 1024).toFixed(0)} MB`;
  }
};

// Calculate storage percentage
export const calculateStoragePercentage = (used: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
};

// Get storage status color based on percentage
export const getStorageStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'destructive';
  if (percentage >= 80) return 'warning';
  if (percentage >= 60) return 'info';
  return 'success';
};

// Get storage warning message
export const getStorageWarningMessage = (percentage: number): string | null => {
  if (percentage >= 90) {
    return "⚠️ Storage critically full! Consider clearing old recordings immediately.";
  }
  if (percentage >= 80) {
    return "⚠️ Storage usage high. Consider clearing old recordings soon.";
  }
  return null;
};
