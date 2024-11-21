import winston, { createLogger, format, transports } from 'winston';
import { LogContext, LogLevel } from './types';

class Logger {
    private logger: winston.Logger;

    constructor() {
        const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

        this.logger = createLogger({
            level: logLevel,
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json()
            ),
            defaultMeta: { service: 'blog-processor' },
            transports: [
                // Console transport for development
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({ timestamp, level, message, ...meta }) => {
                            const context = meta.context ?
                                `\n${JSON.stringify(meta.context, null, 2)}` : '';
                            return `${timestamp} [${level}]: ${message}${context}`;
                        })
                    )
                }),

                // File transport for production
                new transports.File({
                    filename: 'error.log',
                    level: 'error',
                    dirname: 'logs'
                }),
                new transports.File({
                    filename: 'combined.log',
                    dirname: 'logs'
                })
            ]
        });

        // Handle uncaught exceptions and unhandled rejections
        this.logger.exceptions.handle(
            new transports.File({ filename: 'logs/exceptions.log' })
        );

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new transports.Console({
                format: format.simple()
            }));
        }
    }

    private formatMessage(message: string, context?: LogContext): string {
        return context ? `${message} ${JSON.stringify(context)}` : message;
    }

    error(message: string, context?: LogContext): void {
        this.logger.error(message, { context });
    }

    warn(message: string, context?: LogContext): void {
        this.logger.warn(message, { context });
    }

    info(message: string, context?: LogContext): void {
        this.logger.info(message, { context });
    }

    debug(message: string, context?: LogContext): void {
        this.logger.debug(message, { context });
    }

    // Create child logger with additional context
    child(defaultContext: LogContext) {
        const childLogger = this.logger.child(defaultContext);
        return {
            error: (message: string, context?: LogContext) =>
                childLogger.error(message, { context }),
            warn: (message: string, context?: LogContext) =>
                childLogger.warn(message, { context }),
            info: (message: string, context?: LogContext) =>
                childLogger.info(message, { context }),
            debug: (message: string, context?: LogContext) =>
                childLogger.debug(message, { context })
        };
    }
}

// Create and export singleton instance
export const logger = new Logger();