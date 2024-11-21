export interface LogContext {
  [key: string]: any;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';