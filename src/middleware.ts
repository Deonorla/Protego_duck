// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Rate limiting (basic implementation)
  const ip = request.ip || 'unknown';
  const now = Date.now();
  
  // Simple in-memory rate limiting (use Redis in production)
  if (!globalThis.rateLimitMap) {
    globalThis.rateLimitMap = new Map();
  }
  
  const clientRequests = globalThis.rateLimitMap.get(ip) || [];
  const recentRequests = clientRequests.filter((time: number) => now - time < 60000); // 1 minute window
  
  if (recentRequests.length >= 60) { // 60 requests per minute
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }
  
  recentRequests.push(now);
  globalThis.rateLimitMap.set(ip, recentRequests);
  
  return response;
}

export const config = {
  matcher: '/api/sei-mcp/:path*'
};