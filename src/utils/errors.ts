export class JeanError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number = 400,
      public details?: Record<string, any>
    ) {
      super(message);
      this.name = 'JeanError';
    }
  }
  
  export class AuthenticationError extends JeanError {
    constructor(message: string) {
      super('AUTH_ERROR', message, 401);
    }
  }
  
  export class EmbeddingError extends JeanError {
    constructor(message: string, details?: Record<string, any>) {
      super('EMBEDDING_ERROR', message, 400, details);
    }
  }
  
  export class UnderstandingError extends JeanError {
    constructor(message: string, details?: Record<string, any>) {
      super('UNDERSTANDING_ERROR', message, 400, details);
    }
  }
  
  export function handleError(error: unknown): JeanError {
    if (error instanceof JeanError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new JeanError('UNKNOWN_ERROR', error.message, 500);
    }
    
    return new JeanError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      500
    );
  }