import { Injectable } from '@angular/core';

/**
 * Log levels for the application
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Standard logger service for consistent log formatting
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly appName = 'Admin';
  private logLevel: LogLevel = LogLevel.DEBUG; // Default to showing all logs

  /**
   * Set the minimum log level to display
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log a debug message
   */
  debug(component: string, message: string, ...data: any[]): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  /**
   * Log an info message
   */
  info(component: string, message: string, ...data: any[]): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  /**
   * Log a warning message
   */
  warn(component: string, message: string, ...data: any[]): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  /**
   * Log an error message
   */
  error(component: string, message: string, ...data: any[]): void {
    this.log(LogLevel.ERROR, component, message, data);
  }

  /**
   * Internal logging method that formats logs consistently
   */
  private log(
    level: LogLevel,
    component: string,
    message: string,
    data: any[]
  ): void {
    // Skip logging if the level is below the configured minimum
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}][${this.appName}][${level}][${component}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMsg, ...(data || []));
        break;
      case LogLevel.INFO:
        console.info(formattedMsg, ...(data || []));
        break;
      case LogLevel.WARN:
        console.warn(formattedMsg, ...(data || []));
        break;
      case LogLevel.ERROR:
        console.error(formattedMsg, ...(data || []));
        break;
    }
  }

  /**
   * Determines if a log entry should be displayed based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const logLevelIndex = levels.indexOf(level);

    return logLevelIndex >= currentLevelIndex;
  }
}
