// app/debug/auth/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieNames = allCookies.map(cookie => cookie.name);
    
    console.log('🍪 [Debug Auth] Available cookies:', cookieNames);
    
    // Look for authentication cookie specifically
    const authCookie = cookieStore.get('sb-eqvlsceuumtwkuagolmv-auth-token');
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify session with Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [Debug Auth] Error verifying session:', error.message);
      
      return NextResponse.json({
        status: "error",
        message: "Error verifying session",
        error: error.message,
        hasCookie: !!authCookie,
        cookieNames
      });
    }
    
    if (!data.session) {
      console.log('ℹ️ [Debug Auth] No active session in Supabase');
      
      return NextResponse.json({
        status: "unauthorized",
        message: "No active session",
        hasCookie: !!authCookie,
        cookieNames
      });
    }
    
    // Session found
    const userId = data.session.user.id;
    const email = data.session.user.email;
    const expires_at = data.session.expires_at;
    
    // Calculate remaining session time
    let expiresIn = null;
    if (expires_at) {
      const expirationDate = new Date(expires_at * 1000);
      const now = new Date();
      expiresIn = Math.round((expirationDate.getTime() - now.getTime()) / (60 * 1000));
    }
    
    return NextResponse.json({
      status: "authenticated",
      message: "User authenticated",
      userId,
      email,
      expiresIn: expiresIn !== null ? `${expiresIn} minutes` : null,
      hasCookie: !!authCookie,
      cookieNames
    });
    
  } catch (error: any) {
    console.error('❌ [Debug Auth] Error:', error);
    
    return NextResponse.json({
      status: "error",
      message: "Internal error",
      error: error.message
    }, { status: 500 });
  }
}