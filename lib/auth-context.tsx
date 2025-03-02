// lib/auth-context.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createSupabaseClient } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

// Default context values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createSupabaseClient();

  // Function to update authentication state
  const refreshAuth = async () => {
    try {
      console.log("🔄 [AuthContext] Refreshing authentication state...");
      
      // Check session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ [AuthContext] Error getting session:", error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        console.log("✅ [AuthContext] Session updated - User authenticated:", data.session.user.id);
        
        // Show session expiration time
        const expiresAt = data.session.expires_at;
        if (expiresAt) {
          const expirationDate = new Date(expiresAt * 1000);
          const now = new Date();
          const minutesRemaining = Math.round((expirationDate.getTime() - now.getTime()) / (1000 * 60));
          console.log(`⏰ [AuthContext] Session expires in ${minutesRemaining} minutes (${expirationDate.toLocaleString()})`);
        }
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log("❌ [AuthContext] No active session");
      }
    } catch (error) {
      console.error("❌ [AuthContext] Error in refreshAuth:", error);
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Initialize and listen for authentication changes
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if there's a session on load
        await refreshAuth();
        
        // Setup listener for authentication changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log(`🔔 [AuthContext] Authentication event: ${event}`);
            
            if (currentSession) {
              setSession(currentSession);
              setUser(currentSession.user);
              setIsAuthenticated(true);
              console.log("✅ [AuthContext] User authenticated:", currentSession.user.id);
            } else {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
              console.log("❌ [AuthContext] No authenticated user");
            }
          }
        );
        
        // Cleanup listener on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("❌ [AuthContext] Error initializing authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};