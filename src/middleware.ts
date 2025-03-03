// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is an admin route
  const isAdminRoute = path.startsWith('/admin');
  
  if (isAdminRoute) {
    // Get the session token
    const token = await getToken({ 
      req: request as any, // Type assertion since getToken expects a slightly different req type
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // If no token, redirect to unauthorized page
    if (!token) {
      console.log("No token found, redirecting to unauthorized"); // Debug log
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Fetch user data from /api/user to get the role
    const userResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/user`, {
      headers: {
        cookie: request.headers.get('cookie') || '', // Pass session cookies
      },
    });

    if (!userResponse.ok) {
      console.log("Failed to fetch user data, redirecting to unauthorized"); // Debug log
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    const userData = await userResponse.json();
    const userRole = userData.user.role;

    console.log("User role:", userRole); // Debug log

    // Check if user has admin role
    if (userRole !== 'admin') {
      console.log("User is not admin, redirecting to unauthorized"); // Debug log
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    console.log("Admin access granted"); // Debug log
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};