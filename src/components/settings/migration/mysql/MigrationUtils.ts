
/**
 * Simulate an operation with a delay
 * @param operation Operation description
 * @param duration Duration in milliseconds
 * @returns Promise that resolves after the given duration
 */
export const simulateOperation = (operation: string, duration: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    console.log(`Operation: ${operation}`);
    setTimeout(() => {
      resolve();
    }, duration);
  });
};
