import pino from 'pino';

// Create a Pino logger instance
// In development, logs will be formatted nicely using pino-pretty
// In production, logs will be standard JSON suitable for DataDog / ELK
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'skillforge-backend',
  },
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});
