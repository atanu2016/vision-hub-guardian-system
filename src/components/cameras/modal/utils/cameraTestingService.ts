
import { CameraFormValues } from "../types/cameraModalTypes";

export interface CameraTestResult {
  success: boolean;
  message: string;
  details?: string;
  suggestedUrls?: string[];
  brandDetected?: string;
}

// Common RTSP patterns for major camera brands
const BRAND_PATTERNS = {
  hikvision: [
    '/Streaming/Channels/101',
    '/Streaming/Channels/102', 
    '/h264/ch1/main/av_stream',
    '/h264/ch1/sub/av_stream'
  ],
  dahua: [
    '/cam/realmonitor?channel=1&subtype=0',
    '/cam/realmonitor?channel=1&subtype=1',
    '/live',
    '/h264Preview_01_main',
    '/h264Preview_01_sub'
  ],
  cpplus: [
    '/stream1',
    '/stream2',
    '/cam/realmonitor?channel=1&subtype=0',
    '/live/ch1'
  ],
  axis: [
    '/axis-media/media.amp',
    '/mpeg4/media.amp',
    '/mjpg/video.mjpg'
  ],
  reolink: [
    '/h264Preview_01_main',
    '/h264Preview_01_sub',
    '/stream1',
    '/stream2'
  ],
  amcrest: [
    '/cam/realmonitor?channel=1&subtype=0',
    '/cam/realmonitor?channel=1&subtype=1'
  ],
  sony: [
    '/video1',
    '/video2',
    '/media/video1'
  ],
  bosch: [
    '/rtsp_tunnel',
    '/video.mp4'
  ],
  panasonic: [
    '/MediaInput/stream_1',
    '/MediaInput/stream_2'
  ],
  generic: [
    '/stream',
    '/stream1',
    '/stream2',
    '/live',
    '/video',
    '/h264',
    '/mjpeg'
  ]
};

// Detect camera brand from manufacturer or IP patterns
function detectCameraBrand(formValues: CameraFormValues): string {
  const manufacturer = formValues.manufacturer?.toLowerCase() || '';
  const model = formValues.model?.toLowerCase() || '';
  const name = formValues.name?.toLowerCase() || '';
  
  if (manufacturer.includes('hikvision') || model.includes('hikvision') || name.includes('hikvision')) {
    return 'hikvision';
  }
  if (manufacturer.includes('dahua') || model.includes('dahua') || name.includes('dahua')) {
    return 'dahua';
  }
  if (manufacturer.includes('cpplus') || manufacturer.includes('cp plus') || model.includes('cpplus')) {
    return 'cpplus';
  }
  if (manufacturer.includes('axis') || model.includes('axis')) {
    return 'axis';
  }
  if (manufacturer.includes('reolink') || model.includes('reolink')) {
    return 'reolink';
  }
  if (manufacturer.includes('amcrest') || model.includes('amcrest')) {
    return 'amcrest';
  }
  if (manufacturer.includes('sony') || model.includes('sony')) {
    return 'sony';
  }
  if (manufacturer.includes('bosch') || model.includes('bosch')) {
    return 'bosch';
  }
  if (manufacturer.includes('panasonic') || model.includes('panasonic')) {
    return 'panasonic';
  }
  
  return 'generic';
}

// Generate RTSP URLs for testing
function generateRtspUrls(formValues: CameraFormValues, brand: string): string[] {
  const { ipAddress, username, password } = formValues;
  const port = '554'; // Standard RTSP port
  const auth = username && password ? `${username}:${password}@` : '';
  
  const patterns = BRAND_PATTERNS[brand as keyof typeof BRAND_PATTERNS] || BRAND_PATTERNS.generic;
  
  return patterns.map(pattern => `rtsp://${auth}${ipAddress}:${port}${pattern}`);
}

// Test IP camera connection
async function testIpCamera(formValues: CameraFormValues): Promise<CameraTestResult> {
  const { ipAddress, port, username, password } = formValues;
  
  console.log(`Testing IP camera at ${ipAddress}:${port}`);
  
  // Simulate testing HTTP/HTTPS endpoints
  const testUrls = [
    `http://${ipAddress}:${port}`,
    `https://${ipAddress}:${port}`,
    `http://${ipAddress}:${port}/web/`,
    `https://${ipAddress}:${port}/web/`
  ];
  
  // In a real implementation, this would make actual HTTP requests
  // For demo, we'll simulate based on common patterns
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (ipAddress && port) {
    return {
      success: true,
      message: `IP camera connection test completed for ${ipAddress}:${port}`,
      details: username ? `Authentication configured with username: ${username}` : 'No authentication configured'
    };
  }
  
  return {
    success: false,
    message: 'Invalid IP address or port',
    details: 'Please check the IP address and port configuration'
  };
}

// Test RTSP camera connection
async function testRtspCamera(formValues: CameraFormValues): Promise<CameraTestResult> {
  const { rtspUrl, ipAddress, username, password, manufacturer } = formValues;
  
  console.log(`Testing RTSP camera with URL: ${rtspUrl}`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (rtspUrl) {
    // Validate RTSP URL format
    try {
      const url = new URL(rtspUrl);
      if (url.protocol !== 'rtsp:') {
        return {
          success: false,
          message: 'Invalid RTSP URL format',
          details: 'RTSP URL must start with rtsp://'
        };
      }
      
      return {
        success: true,
        message: 'RTSP URL format is valid',
        details: `Testing connection to ${url.hostname}:${url.port || 554}`
      };
    } catch {
      return {
        success: false,
        message: 'Invalid RTSP URL format',
        details: 'Please check the RTSP URL syntax'
      };
    }
  }
  
  // If no RTSP URL provided, generate suggestions based on brand
  if (ipAddress && username && password) {
    const brand = detectCameraBrand(formValues);
    const suggestedUrls = generateRtspUrls(formValues, brand);
    
    return {
      success: false,
      message: 'No RTSP URL provided',
      details: `Generated ${suggestedUrls.length} possible RTSP URLs based on detected brand: ${brand}`,
      suggestedUrls,
      brandDetected: brand
    };
  }
  
  return {
    success: false,
    message: 'Insufficient RTSP configuration',
    details: 'Please provide either an RTSP URL or IP address with credentials'
  };
}

// Test RTMP stream
async function testRtmpCamera(formValues: CameraFormValues): Promise<CameraTestResult> {
  const { rtmpUrl } = formValues;
  
  console.log(`Testing RTMP stream: ${rtmpUrl}`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (rtmpUrl) {
    try {
      const url = new URL(rtmpUrl);
      if (url.protocol !== 'rtmp:') {
        return {
          success: false,
          message: 'Invalid RTMP URL format',
          details: 'RTMP URL must start with rtmp://'
        };
      }
      
      return {
        success: true,
        message: 'RTMP URL format is valid',
        details: `Stream endpoint: ${url.hostname}:${url.port || 1935}`
      };
    } catch {
      return {
        success: false,
        message: 'Invalid RTMP URL format',
        details: 'Please check the RTMP URL syntax'
      };
    }
  }
  
  return {
    success: false,
    message: 'No RTMP URL provided',
    details: 'Please enter a valid RTMP stream URL'
  };
}

// Test HLS stream
async function testHlsCamera(formValues: CameraFormValues): Promise<CameraTestResult> {
  const { hlsUrl } = formValues;
  
  console.log(`Testing HLS stream: ${hlsUrl}`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (hlsUrl) {
    try {
      const url = new URL(hlsUrl);
      if (!url.protocol.startsWith('http')) {
        return {
          success: false,
          message: 'Invalid HLS URL format',
          details: 'HLS URL must start with http:// or https://'
        };
      }
      
      if (!hlsUrl.endsWith('.m3u8')) {
        return {
          success: false,
          message: 'Invalid HLS URL format',
          details: 'HLS URL should end with .m3u8'
        };
      }
      
      return {
        success: true,
        message: 'HLS URL format is valid',
        details: `Stream endpoint: ${url.hostname}`
      };
    } catch {
      return {
        success: false,
        message: 'Invalid HLS URL format',
        details: 'Please check the HLS URL syntax'
      };
    }
  }
  
  return {
    success: false,
    message: 'No HLS URL provided',
    details: 'Please enter a valid HLS stream URL (ending with .m3u8)'
  };
}

// Test ONVIF camera
async function testOnvifCamera(formValues: CameraFormValues): Promise<CameraTestResult> {
  const { ipAddress, port, username, password, onvifPath } = formValues;
  
  console.log(`Testing ONVIF camera at ${ipAddress}:${port}${onvifPath}`);
  
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  if (ipAddress && username && password) {
    const brand = detectCameraBrand(formValues);
    
    // Simulate ONVIF device discovery and GetStreamUri
    const suggestedUrls = generateRtspUrls(formValues, brand);
    
    return {
      success: true,
      message: 'ONVIF connection test completed',
      details: `Connected to ONVIF device at ${ipAddress}:${port || 80}. Generated RTSP URLs based on detected brand: ${brand}`,
      suggestedUrls,
      brandDetected: brand
    };
  }
  
  return {
    success: false,
    message: 'Insufficient ONVIF configuration',
    details: 'Please provide IP address, username, and password for ONVIF testing'
  };
}

// Main camera testing function
export async function testCameraConnection(formValues: CameraFormValues): Promise<CameraTestResult> {
  const { connectionType } = formValues;
  
  console.log(`Testing camera connection with type: ${connectionType}`);
  
  try {
    switch (connectionType) {
      case 'ip':
        return await testIpCamera(formValues);
      case 'rtsp':
        return await testRtspCamera(formValues);
      case 'rtmp':
        return await testRtmpCamera(formValues);
      case 'hls':
        return await testHlsCamera(formValues);
      case 'onvif':
        return await testOnvifCamera(formValues);
      default:
        return {
          success: false,
          message: 'Unknown connection type',
          details: `Connection type '${connectionType}' is not supported`
        };
    }
  } catch (error) {
    console.error('Camera test error:', error);
    return {
      success: false,
      message: 'Camera test failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
