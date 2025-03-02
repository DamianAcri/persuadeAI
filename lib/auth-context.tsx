"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

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
  const supabase = createClientComponentClient();

  // Función para actualizar el estado de autenticación
  const refreshAuth = async () => {
    try {
      console.log("🔄 [AuthContext] Actualizando estado de autenticación...");
      
      // Verificar sesión
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ [AuthContext] Error al obtener sesión:", error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      if (sessionData?.session) {
        setSession(sessionData.session);
        setUser(sessionData.session.user);
        setIsAuthenticated(true);
        console.log("✅ [AuthContext] Sesión actualizada - Usuario autenticado:", sessionData.session.user.id);
        
        // Mostrar cuando expira la sesión
        const expiresAt = sessionData.session.expires_at;
        if (expiresAt) {
          const expirationDate = new Date(expiresAt * 1000);
          const now = new Date();
          const minutesRemaining = Math.round((expirationDate.getTime() - now.getTime()) / (1000 * 60));
          console.log(`⏰ [AuthContext] La sesión expira en ${minutesRemaining} minutos (${expirationDate.toLocaleString()})`);
        }
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log("❌ [AuthContext] No hay sesión activa");
      }
    } catch (error) {
      console.error("❌ [AuthContext] Error en refreshAuth:", error);
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Inicializar y escuchar cambios de autenticación
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Verificar si hay sesión al cargar
        await refreshAuth();
        
        // Configurar listener para cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log(`🔔 [AuthContext] Evento de autenticación: ${event}`);
            
            if (currentSession) {
              setSession(currentSession);
              setUser(currentSession.user);
              setIsAuthenticated(true);
              console.log("✅ [AuthContext] Usuario autenticado:", currentSession.user.id);
            } else {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
              console.log("❌ [AuthContext] No hay usuario autenticado");
            }
          }
        );
        
        // Limpiar el listener al desmontar
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("❌ [AuthContext] Error inicializando autenticación:", error);
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
