export interface LogContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';