import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 定义CORS中间件
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 添加CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  return response;
}

// 配置匹配器，只对API路由应用中间件
export const config = {
  matcher: '/api/:path*',
};