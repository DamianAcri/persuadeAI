// lib/supabase.ts - Base Supabase client

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a base client for non-component usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// For use within components (preferred method)
export const createSupabaseClient = () => createClientComponentClient<Database>();

// Verify Supabase session
export const checkSupabaseSession = async () => {
  try {
    // Get client for browser environment
    const client = typeof window !== 'undefined' 
      ? createClientComponentClient<Database>() 
      : supabase;
    
    const { data, error } = await client.auth.getSession();
    const hasSession = !!data.session;
    const userId = data.session?.user?.id;
    
    console.log(`🔍 [supabase] Session check: ${hasSession ? 'Active ✅' : 'Inactive ❌'}`);
    
    return { 
      hasSession,
      userId,
      error: error?.message
    };
  } catch (error: any) {
    console.error('❌ [supabase] Session verification error:', error);
    return { hasSession: false, userId: null, error: error.message };
  }
};