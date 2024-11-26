import { NextFunction, Request, Response } from 'express';
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define log directory
const logDir = path.join(process.cwd(), 'logs');

// Create transport for daily rotating files
const fileTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Separate transport for errors
const errorFileTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'thoughtforge' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    fileTransport,
    errorFileTransport
  ]
});

// Add request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response
  res.on('finish', () => {
    logger.info('Response sent', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: Date.now() - req.socket.bytesRead
    });
  });

  next();
};

// Example usage:
// logger.info('Info message');
// logger.error('Error message', { error: new Error('Something went wrong') });
// logger.warn('Warning message', { customField: 'value' });
