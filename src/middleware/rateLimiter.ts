import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many create requests from this IP',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const heavyOperationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many heavy operations from this IP',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too many read requests from this IP',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const updateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many update requests from this IP',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
  message: {
    error: 'Too many health check requests from this IP',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const deleteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many delete requests from this IP',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
