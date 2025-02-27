import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Apply middleware to dashboard routes
export const config = {
  matcher: '/dashboard/:path*',
};

export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  const res = NextResponse.next();
  
  // Create the Supabase middleware client
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  console.log('Middleware checking session:', session ? 'Session exists' : 'No session');
  
  // If there's no active session, redirect to the login page
  if (!session) {
    const redirectUrl = new URL('/auth/login', req.url);
    console.log('No session, redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }
  
  // Session exists, proceed to the requested page
  console.log('Session found, proceeding to dashboard');
  return res;
}