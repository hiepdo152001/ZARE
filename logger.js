import winston from 'winston';
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

export const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({
      filename: 'zarena.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Rotate to a new file after 5MB
    }) // Log to a file
  ],
});

// logger.info('This is an info message.');
// logger.warn('This is a warning message.');
// logger.error('This is an error message.');