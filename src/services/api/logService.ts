
/**
 * Stream logs in real-time (simplified implementation)
 */
export const streamLogs = (callback: (log: any) => void) => {
  // Simulate real-time logs
  const interval = setInterval(() => {
    callback({
      id: Date.now().toString(),
      level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
      message: `Log entry at ${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      source: 'system'
    });
  }, 5000);
  
  // Return cleanup function
  return () => clearInterval(interval);
};
