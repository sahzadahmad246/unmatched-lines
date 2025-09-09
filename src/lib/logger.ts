// Simple logging system to replace console.log
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: string, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      level: level as LogEntry['level'],
      message,
      timestamp: new Date().toISOString(),
      context,
      stack: error?.stack
    };
  }

  info(message: string, context?: Record<string, unknown>) {
    const logEntry = this.formatLog('info', message, context);
    if (this.isDevelopment) {
      console.log(`[INFO] ${logEntry.timestamp}: ${message}`, context || '');
    }
    // In production, you would send this to a logging service
  }

  warn(message: string, context?: Record<string, unknown>) {
    const logEntry = this.formatLog('warn', message, context);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${logEntry.timestamp}: ${message}`, context || '');
    }
    // In production, you would send this to a logging service
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    const logEntry = this.formatLog('error', message, context, error);
    if (this.isDevelopment) {
      console.error(`[ERROR] ${logEntry.timestamp}: ${message}`, {
        error: error?.message,
        stack: error?.stack,
        context
      });
    }
    // In production, you would send this to a logging service
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      const logEntry = this.formatLog('debug', message, context);
      console.debug(`[DEBUG] ${logEntry.timestamp}: ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
