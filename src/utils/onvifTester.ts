
/**
 * ONVIF Connection Tester
 * This utility helps troubleshoot ONVIF camera connections
 */

export interface ONVIFConnectionParams {
  hostname: string;
  port: number;
  username: string;
  password: string;
  servicePath?: string;
}

export interface ONVIFTestResult {
  success: boolean;
  message: string;
  details?: any;
  streamUri?: string;
}

/**
 * Test connection to an ONVIF camera
 * Note: This runs in the browser and will likely be blocked by CORS.
 * It's mainly for illustration purposes - in production, this would be a server-side function.
 */
export const testONVIFConnection = async (
  params: ONVIFConnectionParams
): Promise<ONVIFTestResult> => {
  try {
    console.log("Testing ONVIF connection:", params);
    
    // In a browser environment, direct ONVIF connection will fail due to CORS
    // In a real application, this would be a backend API call
    
    // This is a simulation - in reality we'd use a backend service
    const simulated = await simulateONVIFTest(params);
    return simulated;
    
  } catch (error) {
    console.error("ONVIF test failed:", error);
    return {
      success: false,
      message: "ONVIF test failed: " + (error.message || "Unknown error"),
    };
  }
};

// Simulate an ONVIF test - in production this would be a real backend call
const simulateONVIFTest = (params: ONVIFConnectionParams): Promise<ONVIFTestResult> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // For demo purposes, succeed only for certain test values
      if (params.hostname === '192.168.1.100' && params.username === 'admin') {
        resolve({
          success: true,
          message: "Successfully connected to ONVIF camera",
          details: {
            manufacturer: "Sample Camera Co.",
            model: "IP Camera v2",
            firmware: "1.2.3",
            serialNumber: "SN12345678"
          },
          streamUri: `rtsp://${params.username}:${params.password}@${params.hostname}:554/Streaming/Channels/101`
        });
      } else {
        resolve({
          success: false,
          message: "Failed to connect to ONVIF camera. Check credentials and network connectivity.",
        });
      }
    }, 1500);
  });
};

/**
 * Generate RTSP URLs based on camera information
 */
export const suggestRtspUrls = (
  hostname: string, 
  port?: number, 
  username?: string, 
  password?: string, 
  manufacturer?: string
): string[] => {
  // Format authentication part
  const auth = username && password ? `${username}:${password}@` : '';
  const rtspPort = '554'; // Standard RTSP port
  
  const lowercaseManufacturer = (manufacturer || "").toLowerCase();
  const urls = [];
  
  // Add common patterns
  if (lowercaseManufacturer.includes("hikvision") || hostname.includes("hikvision")) {
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/Streaming/Channels/101`); // Main stream
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/Streaming/Channels/102`); // Sub stream
  } 
  else if (lowercaseManufacturer.includes("dahua") || hostname.includes("dahua")) {
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/cam/realmonitor?channel=1&subtype=0`); // Main stream
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/cam/realmonitor?channel=1&subtype=1`); // Sub stream
  } 
  else if (lowercaseManufacturer.includes("axis") || hostname.includes("axis")) {
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/axis-media/media.amp`);
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/mpeg4/media.amp`);
  } 
  else if (lowercaseManufacturer.includes("sony") || hostname.includes("sony")) {
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/video1`);
  }
  else {
    // Generic options for unknown manufacturers
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/stream1`);
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/h264`);
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/live`);
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/11`);
    urls.push(`rtsp://${auth}${hostname}:${rtspPort}/profile1/media.smp`);
  }
  
  return urls;
};
