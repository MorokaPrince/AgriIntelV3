/**
 * Security Headers Middleware
 * Provides comprehensive security headers for API routes and pages
 */

import { NextRequest, NextResponse } from 'next/server';

interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  hstsMaxAge?: number;
  enableHSTS?: boolean;
  enableXSSProtection?: boolean;
  enableContentTypeProtection?: boolean;
  enableDNSPrefetchControl?: boolean;
  enableFrameOptions?: boolean;
  frameOptions?: string;
  enableReferrerPolicy?: boolean;
  referrerPolicy?: string;
  enablePermissionsPolicy?: boolean;
  permissionsPolicy?: string;
}

const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
  hstsMaxAge: 31536000, // 1 year
  enableHSTS: true,
  enableXSSProtection: true,
  enableContentTypeProtection: true,
  enableDNSPrefetchControl: true,
  enableFrameOptions: true,
  frameOptions: 'DENY',
  enableReferrerPolicy: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  enablePermissionsPolicy: true,
  permissionsPolicy: `
    camera=(),
    microphone=(),
    geolocation=(),
    payment=(),
    usb=(),
    bluetooth=(),
    magnetometer=(),
    accelerometer=(),
    gyroscope=(),
    ambient-light-sensor=(),
    autoplay=(),
    encrypted-media=(),
    fullscreen=(self),
    picture-in-picture=()
  `.replace(/\s+/g, ' ').trim(),
};

/**
 * Creates security headers for API routes
 */
export function createSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (mergedConfig.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = mergedConfig.contentSecurityPolicy;
  }

  // HTTP Strict Transport Security
  if (mergedConfig.enableHSTS) {
    const hstsValue = `max-age=${mergedConfig.hstsMaxAge}`;
    if (process.env.NODE_ENV === 'production') {
      headers['Strict-Transport-Security'] = `${hstsValue}; includeSubDomains; preload`;
    } else {
      headers['Strict-Transport-Security'] = hstsValue;
    }
  }

  // X-Content-Type-Options
  if (mergedConfig.enableContentTypeProtection) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // X-Frame-Options
  if (mergedConfig.enableFrameOptions) {
    headers['X-Frame-Options'] = mergedConfig.frameOptions || 'DENY';
  }

  // X-XSS-Protection
  if (mergedConfig.enableXSSProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Referrer Policy
  if (mergedConfig.enableReferrerPolicy) {
    headers['Referrer-Policy'] = mergedConfig.referrerPolicy || 'strict-origin-when-cross-origin';
  }

  // Permissions Policy (formerly Feature Policy)
  if (mergedConfig.enablePermissionsPolicy) {
    headers['Permissions-Policy'] = mergedConfig.permissionsPolicy || '';
  }

  // DNS Prefetch Control
  if (mergedConfig.enableDNSPrefetchControl) {
    headers['X-DNS-Prefetch-Control'] = 'off';
  }

  // Additional security headers
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';
  headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
  headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  headers['Cross-Origin-Resource-Policy'] = 'same-origin';

  return headers;
}

/**
 * Middleware function to add security headers to API responses
 */
export function withSecurityHeaders(
  handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>,
  config?: SecurityHeadersConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request, NextResponse.next());

    // Add security headers
    const securityHeaders = createSecurityHeaders(config);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * API-specific security headers (more restrictive)
 */
export function createApiSecurityHeaders(): Record<string, string> {
  return createSecurityHeaders({
    contentSecurityPolicy: `
      default-src 'none';
      script-src 'none';
      style-src 'none';
      img-src 'none';
      font-src 'none';
      connect-src 'self';
      frame-ancestors 'none';
      form-action 'none';
    `.replace(/\s+/g, ' ').trim(),
    enablePermissionsPolicy: false, // APIs don't need permissions policy
  });
}

/**
 * Middleware function specifically for API routes
 */
export function withApiSecurityHeaders(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);

    // Add API-specific security headers
    const securityHeaders = createApiSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Additional API-specific headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  };
}

/**
 * Rate limiting helper for security middleware
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimitSecurity(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60 * 60 * 1000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes