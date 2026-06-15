type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.isProduction) {
      // In production, log structured information without full traces to prevent leakages
      const logPayload = {
        level,
        message,
        timestamp,
        ...(meta !== undefined && meta !== null
          ? {
              // Exclude Error objects stack trace in production metadata to be safe
              meta: meta instanceof Error ? { name: meta.name, message: meta.message } : meta,
            }
          : {}),
      };

      if (level === 'error') {
        console.error(JSON.stringify(logPayload));
      } else if (level === 'warn') {
        console.warn(JSON.stringify(logPayload));
      } else {
        console.log(JSON.stringify(logPayload));
      }
    } else {
      // In development, log friendly output with error stack traces for easy debugging
      if (level === 'error') {
        console.error(`${prefix} ${message}`, meta || '');
      } else if (level === 'warn') {
        console.warn(`${prefix} ${message}`, meta || '');
      } else {
        console.log(`${prefix} ${message}`, meta || '');
      }
    }
  }

  info(message: string, meta?: unknown) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: unknown) {
    this.log('error', message, meta);
  }
}

export const logger = new Logger();
