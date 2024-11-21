import winston, { format, transports, createLogger } from 'winston';
import { LogContext } from './types';


class Logger {
  private logger: winston.Logger;
  
  constructor() {
      this.logger = createLogger({
          format: format.combine(
              format.timestamp(),
              format.json()
          ),
          transports: [
              new transports.Console({
                  format: format.simple()
              })
          ]
      });
  }

  error(message: string, context?: LogContext): void {
      this.logger.error(message, { context });
  }

  info(message: string, context?: LogContext): void {
      this.logger.info(message, { context });
  }

  debug(message: string, context?: LogContext): void {
      this.logger.debug(message, { context });
  }
}

export const logger = new Logger();