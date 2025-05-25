
import { supabase } from "@/integrations/supabase/client";

export interface LogEntry {
  id?: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  source: string;
  details?: string;
  context?: Record<string, any>;
}

class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private maxLocalLogs = 1000;

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  async log(level: LogEntry['level'], message: string, source: string, details?: string, context?: Record<string, any>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      details,
      context
    };

    // Add to local logs for immediate access
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLocalLogs) {
      this.logs = this.logs.slice(0, this.maxLocalLogs);
    }

    // Also log to console for immediate debugging
    const consoleMessage = `[${level.toUpperCase()}] [${source}] ${message}`;
    if (details) {
      console.log(consoleMessage, details, context || '');
    } else {
      console.log(consoleMessage, context || '');
    }

    // Save to database
    try {
      await supabase.from('system_logs').insert(logEntry);
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }

  debug(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.log('debug', message, source, details, context);
  }

  info(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.log('info', message, source, details, context);
  }

  warning(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.log('warning', message, source, details, context);
  }

  error(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.log('error', message, source, details, context);
  }

  getLocalLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLocalLogs() {
    this.logs = [];
  }

  // RTSP specific logging
  logRTSPAttempt(cameraName: string, rtspUrl: string, port: number) {
    this.info(
      `Attempting RTSP connection to ${cameraName}`,
      'rtsp-stream',
      `URL: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`,
      { cameraName, port, protocol: 'rtsp' }
    );
  }

  logRTSPSuccess(cameraName: string, port: number) {
    this.info(
      `RTSP connection successful for ${cameraName}`,
      'rtsp-stream',
      `Connected on port ${port}`,
      { cameraName, port, status: 'connected' }
    );
  }

  logRTSPError(cameraName: string, error: string, rtspUrl?: string, port?: number) {
    this.error(
      `RTSP connection failed for ${cameraName}`,
      'rtsp-stream',
      error,
      { 
        cameraName, 
        error, 
        rtspUrl: rtspUrl?.replace(/(:.*?@)/g, ':****@'),
        port,
        status: 'failed' 
      }
    );
  }

  logRTSPPortIssue(cameraName: string, detectedPort: string, requiredPort: string) {
    this.warning(
      `Port mismatch detected for ${cameraName}`,
      'rtsp-stream',
      `Detected port ${detectedPort}, but system requires port ${requiredPort}`,
      { cameraName, detectedPort, requiredPort }
    );
  }
}

export const logger = LoggingService.getInstance();
