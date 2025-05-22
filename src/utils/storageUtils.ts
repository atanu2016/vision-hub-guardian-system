
/**
 * Parse storage value string (like "10 GB") to numeric value in GB
 */
export const parseStorageValue = (storageString?: string): number => {
  if (!storageString) return 0;
  
  // Extract numeric part
  const numericMatch = storageString.match(/[\d.]+/);
  const numericValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
  
  // Extract unit part
  const unitMatch = storageString.match(/[A-Za-z]+/);
  const unit = unitMatch ? unitMatch[0].toUpperCase() : 'B';
  
  // Convert to GB
  switch (unit) {
    case 'KB':
      return numericValue / (1024 * 1024);
    case 'MB':
      return numericValue / 1024;
    case 'GB':
      return numericValue;
    case 'TB':
      return numericValue * 1024;
    case 'PB':
      return numericValue * 1024 * 1024;
    default:
      return numericValue / (1024 * 1024 * 1024); // Bytes to GB
  }
};

/**
 * Format storage value in bytes to human-readable string
 */
export const formatStorageValue = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};
