import rateLimit from 'express-rate-limit';

// AI rate limiter: 20 requests per hour per user or IP
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? `user:${req.user.id}` : req.ip,
  message: { error: 'AI rate limit exceeded. Max 20 requests/hour.' }
});
