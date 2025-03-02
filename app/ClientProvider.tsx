// app/ClientProvider.tsx
"use client";

import { useState, useEffect } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createClientComponentClient());
  const [isLoading, setIsLoading] = useState(true);
  
  // Check and log the authentication state when the provider mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else {
        console.log("Client provider session check:", data.session ? "Session exists" : "No session");
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [supabaseClient]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading authentication...</div>;
  }
  
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}