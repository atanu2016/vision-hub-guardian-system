
/**
 * Simulated connection test for camera
 * In a real application, this would make an API call to verify the connection
 */
export function simulateCameraConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 90% chance of success for demo purposes
      if (Math.random() < 0.9) {
        resolve();
      } else {
        reject(new Error("Connection failed"));
      }
    }, 1000); // Simulate network delay
  });
}
