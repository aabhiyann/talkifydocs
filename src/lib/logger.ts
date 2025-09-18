// Simple logger implementation to avoid worker thread issues
const isDevelopment = process.env.NODE_ENV === 'development'

interface LogLevel {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

const createLogger = (service: string = 'app'): LogLevel => ({
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${service}]`, ...args)
    }
  },
  info: (...args: any[]) => {
    console.log(`[${service}]`, ...args)
  },
  warn: (...args: any[]) => {
    console.warn(`[${service}]`, ...args)
  },
  error: (...args: any[]) => {
    console.error(`[${service}]`, ...args)
  },
})

export const logger = createLogger()

// Structured logging helpers
export const loggers = {
  api: createLogger('api'),
  auth: createLogger('auth'),
  db: createLogger('database'),
  upload: createLogger('upload'),
  chat: createLogger('chat'),
  stripe: createLogger('stripe'),
}

// Performance logging
export function logPerformance(operation: string, startTime: number, metadata?: Record<string, any>) {
  const duration = Date.now() - startTime
  logger.info(`Performance: ${operation} completed in ${duration}ms`, { operation, duration, ...metadata })
}

// Error logging with context
export function logError(error: Error, context?: Record<string, any>) {
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  })
}

// Request logging middleware
export function logRequest(req: any, res: any, next?: any) {
  const startTime = Date.now()
  
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
  })

  if (res && next) {
    res.on('finish', () => {
      const duration = Date.now() - startTime
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      })
    })
  }

  if (next) next()
}
