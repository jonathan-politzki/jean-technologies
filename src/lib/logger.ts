type LogLevel = 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: Record<string, any>;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    this.log({ level: 'info', message, context });
  },

  warn(message: string, context?: Record<string, any>) {
    this.log({ level: 'warn', message, context });
  },

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log({ level: 'error', message, error, context });
  },

  log({ level, message, error, context }: LogMessage) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(error && { error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }}),
      ...(context && { context })
    };

    // In development, pretty print
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logData, null, 2));
      return;
    }

    // In production, single line JSON for better log aggregation
    console.log(JSON.stringify(logData));
  }
}; 