import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

// eslint-disable-next-line no-shadow
const logFormat = printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`);

const logger = createLogger({
  format: combine(
    timestamp(),
    logFormat,
  ),
  transports: [
    new transports.File({ filename: 'log/combined.log' }),
    new transports.File({
      filename: 'log/error.log',
      level: 'error',
    }),
    new transports.Console(),
  ],
});

export default logger;
