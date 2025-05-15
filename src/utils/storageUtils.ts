
/**
 * Storage utility functions
 */

// Parse storage values from formatted strings (e.g. "500 GB" to 500)
export const parseStorageValue = (storageString: string | null): number => {
  if (!storageString) return 0;
  
  const matches = storageString.match(/(\d+(?:\.\d+)?)\s*([KMGTP]B)/i);
  if (!matches) return 0;
  
  const value = parseFloat(matches[1]);
  const unit = matches[2].toUpperCase();
  
  // Convert all to GB for consistent comparison
  switch (unit) {
    case 'KB': return value / 1024 / 1024;
    case 'MB': return value / 1024;
    case 'GB': return value;
    case 'TB': return value * 1024;
    case 'PB': return value * 1024 * 1024;
    default: return value;
  }
};
