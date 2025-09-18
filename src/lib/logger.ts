import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// Structured logging helpers
export const loggers = {
  api: logger.child({ service: 'api' }),
  auth: logger.child({ service: 'auth' }),
  db: logger.child({ service: 'database' }),
  upload: logger.child({ service: 'upload' }),
  chat: logger.child({ service: 'chat' }),
  stripe: logger.child({ service: 'stripe' }),
}

// Performance logging
export function logPerformance(operation: string, startTime: number, metadata?: Record<string, any>) {
  const duration = Date.now() - startTime
  logger.info({
    operation,
    duration,
    ...metadata,
  }, `Performance: ${operation} completed in ${duration}ms`)
}

// Error logging with context
export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  }, 'Error occurred')
}

// Request logging middleware
export function logRequest(req: any, res: any, next?: any) {
  const startTime = Date.now()
  
  logger.info({
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
  }, 'Request started')

  if (res && next) {
    res.on('finish', () => {
      const duration = Date.now() - startTime
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      }, 'Request completed')
    })
  }

  if (next) next()
}
