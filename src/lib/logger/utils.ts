import { logger } from './logger';
import { LogContext } from './types';

export class LoggerUtils {
    static logQueueEvent(
        queueName: string,
        eventType: string,
        context?: LogContext
    ) {
        logger.info(`Queue ${queueName} ${eventType}`, {
            ...context,
            queue: queueName,
            eventType
        });
    }

    static logContentEvent(
        contentId: string,
        eventType: string,
        context?: LogContext
    ) {
        logger.info(`Content ${contentId} ${eventType}`, {
            ...context,
            contentId,
            eventType
        });
    }

    static logError(
        error: Error,
        source: string,
        context?: LogContext
    ) {
        logger.error(`Error in ${source}: ${error.message}`, {
            ...context,
            errorStack: error.stack,
            errorName: error.name,
            source
        });
    }

    static logPerformance(
        operation: string,
        durationMs: number,
        context?: LogContext
    ) {
        logger.debug(`Performance: ${operation}`, {
            ...context,
            operation,
            durationMs
        });
    }
}