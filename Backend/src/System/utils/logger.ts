import pino from 'pino';

// Helper to check if pino-pretty is available
let hasPinoPretty = false;
try {
  // In ESM, we can't easily check with require, so we might just rely on NODE_ENV 
  // or a more robust check. For now, let's keep it simple: 
  // only use it if explicitly in development AND we are not in a container environment 
  // that might lack devDeps.
  hasPinoPretty = process.env.NODE_ENV === 'development';
} catch { }

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'skillforge-backend',
  },
  // Only use pretty printing if in development and NOT in production
  ...(process.env.NODE_ENV === 'development' && {
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
