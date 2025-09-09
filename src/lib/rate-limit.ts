// Production-ready rate limiter with multiple strategies
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
): { success: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  const now = Date.now();
  const key = identifier;
  
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      lastRequest: now
    });
    
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }
  
  entry.count++;
  entry.lastRequest = now;
  
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime
  };
}

// Different rate limit presets for different endpoints
export const rateLimitPresets = {
  // Strict limits for sensitive operations
  strict: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  // Moderate limits for regular API calls
  moderate: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  // Lenient limits for public content
  lenient: { limit: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
  // Very strict for authentication
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  // Upload limits
  upload: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 uploads per hour
};

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
