'use client';

interface LogContext {
  userId?: string;
  sessionId?: string;
  page?: string;
  action?: string;
  component?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  [key: string]: any;
}

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

class Logger {
  private sessionId: string;
  private context: LogContext = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalContext();
  }

  private generateSessionId(): string {
    return `frontend-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private setupGlobalContext(): void {
    if (typeof window !== 'undefined') {
      this.context = {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
    }
  }

  private formatLog(entry: LogEntry): void {
    const emoji = {
      info: '💬',
      warn: '⚠️',
      error: '🚨',
      debug: '🐛'
    };

    const logData: any = {
      level: entry.level,
      message: entry.message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...entry.context,
    };

    if (entry.error) {
      logData.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      };
    }

    // Build enhanced prefix with caller info for API errors
    let prefix = `${emoji[entry.level]} [${entry.level.toUpperCase()}]`;
    if (entry.context?.action === 'api_error') {
      const hook = entry.context.hook ? `${entry.context.hook}` : '';
      const component = entry.context.component ? `${entry.context.component}` : '';
      const caller = entry.context.caller || 'unknown';
      
      const callerInfo = [hook, component].filter(Boolean).join(' → ') || caller;
      prefix = `${emoji[entry.level]} [${entry.level.toUpperCase()}] 📍 ${callerInfo}`;
    }
    
    switch (entry.level) {
      case 'error':
        console.error(prefix, entry.message, logData);
        break;
      case 'warn':
        console.warn(prefix, entry.message, logData);
        break;
      case 'debug':
        console.debug(prefix, entry.message, logData);
        break;
      default:
        console.log(prefix, entry.message, logData);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logData);
    }
  }

  private async sendToLoggingService(logData: any): Promise<void> {
    try {
      // Could send to Sentry, LogRocket, or custom endpoint
      // For now just store locally
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(logData);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (err) {
      console.error('Failed to store log:', err);
    }
  }

  setUser(userId: string, userInfo?: any): void {
    this.context.userId = userId;
    if (userInfo) {
      this.context.userInfo = userInfo;
    }
  }

  setPage(page: string): void {
    this.context.page = page;
    this.context.url = typeof window !== 'undefined' ? window.location.href : undefined;
  }

  info(message: string, context?: LogContext): void {
    this.formatLog({ level: 'info', message, context });
  }

  warn(message: string, context?: LogContext): void {
    this.formatLog({ level: 'warn', message, context });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.formatLog({ level: 'error', message, error, context });
  }

  debug(message: string, context?: LogContext): void {
    this.formatLog({ level: 'debug', message, context });
  }

  // Page-specific logging methods
  pageLoad(page: string, context?: LogContext): void {
    this.setPage(page);
    this.info(`Page loaded: ${page}`, { action: 'page_load', ...context });
  }

  pageError(page: string, error: Error, context?: LogContext): void {
    this.error(`Page error: ${page}`, error, { action: 'page_error', page, ...context });
  }

  // CRUD operation logging
  apiCall(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API ${method} ${endpoint}`, { 
      action: 'api_call', 
      method, 
      endpoint, 
      ...context 
    });
  }

  apiSuccess(method: string, endpoint: string, responseTime?: number, context?: LogContext): void {
    this.info(`API ${method} ${endpoint} - SUCCESS`, { 
      action: 'api_success', 
      method, 
      endpoint, 
      responseTime,
      ...context 
    });
  }

  apiError(method: string, endpoint: string, error: Error, context?: LogContext): void {
    // Capture call stack to trace where the request originated
    const stack = new Error().stack;
    const callerInfo = this.extractCallerInfo(stack);
    
    this.error(`API ${method} ${endpoint} - FAILED`, error, { 
      action: 'api_error', 
      method, 
      endpoint,
      caller: callerInfo,
      stackTrace: stack,
      ...context 
    });
  }

  private extractCallerInfo(stack?: string): string {
    if (!stack) return 'unknown';
    
    // Parse stack trace to find the first non-logger, non-api-client call
    const lines = stack.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip logger.ts, api-client.ts, and Error construction lines
      if (
        !line.includes('logger.ts') &&
        !line.includes('api-client.ts') &&
        !line.includes('Error.') &&
        line.includes('at ')
      ) {
        // Extract file name and line number
        const match = line.match(/at\s+(?:(\w+)\s+)?\(?([^)]+):(\d+):(\d+)\)?/);
        if (match) {
          const [, functionName, filePath, lineNum] = match;
          const fileName = filePath.split('/').pop() || filePath;
          return functionName 
            ? `${functionName} (${fileName}:${lineNum})`
            : `${fileName}:${lineNum}`;
        }
        return line.trim();
      }
    }
    return 'unknown';
  }

  // User action logging
  userAction(action: string, target?: string, context?: LogContext): void {
    this.info(`User action: ${action}`, { 
      action: 'user_action', 
      userAction: action, 
      target, 
      ...context 
    });
  }

  // Component error logging
  componentError(component: string, error: Error, context?: LogContext): void {
    this.error(`Component error: ${component}`, error, { 
      action: 'component_error', 
      component, 
      ...context 
    });
  }

  // Form submission logging
  formSubmit(form: string, success: boolean, error?: Error, context?: LogContext): void {
    if (success) {
      this.info(`Form submitted: ${form}`, { action: 'form_submit', form, success, ...context });
    } else {
      this.error(`Form submission failed: ${form}`, error, { action: 'form_submit', form, success, ...context });
    }
  }

  // Navigation logging
  navigation(from: string, to: string, context?: LogContext): void {
    this.info(`Navigation: ${from} → ${to}`, { 
      action: 'navigation', 
      from, 
      to, 
      ...context 
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Hook for React components
export function useLogger(component?: string) {
  const logWithComponent = (message: string, context?: LogContext) => {
    logger.info(message, { component, ...context });
  };

  const errorWithComponent = (message: string, error?: Error, context?: LogContext) => {
    logger.error(message, error, { component, ...context });
  };

  return {
    log: logWithComponent,
    error: errorWithComponent,
    warn: (message: string, context?: LogContext) => logger.warn(message, { component, ...context }),
    debug: (message: string, context?: LogContext) => logger.debug(message, { component, ...context }),
    userAction: (action: string, target?: string, context?: LogContext) => 
      logger.userAction(action, target, { component, ...context }),
  };
}

export default logger;