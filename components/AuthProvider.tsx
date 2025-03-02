"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';

// Definir el tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  authReady: boolean; // Nueva propiedad para indicar que la verificación inicial se completó
};

// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  signOut: async () => {},
  refreshAuth: async () => {},
  authReady: false
});

// Hook para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Componente proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();
  
  // Función para actualizar el estado de autenticación
  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 [AuthProvider] Refrescando estado de autenticación...');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [AuthProvider] Error al obtener sesión:', error.message);
        setError(error.message);
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        console.log('✅ [AuthProvider] Usuario autenticado:', data.session.user.id);
        console.log('📧 [AuthProvider] Email:', data.session.user.email);
        
        // Calcular tiempo hasta expiración
        if (data.session.expires_at) {
          const expiryTime = new Date(data.session.expires_at * 1000);
          const now = new Date();
          const minutesLeft = Math.round((expiryTime.getTime() - now.getTime()) / 60000);
          console.log(`⏰ [AuthProvider] Sesión expira en ${minutesLeft} minutos`);
        }
      } else {
        console.log('ℹ️ [AuthProvider] No hay sesión activa');
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    } catch (e: any) {
      console.error('❌ [AuthProvider] Error inesperado:', e);
      setError(e.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      console.log('👋 [AuthProvider] Sesión cerrada');
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (e: any) {
      console.error('❌ [AuthProvider] Error al cerrar sesión:', e);
      setError(e.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar autenticación al cargar y configurar listener
  useEffect(() => {
    // Función para verificar la sesión inicial
    const initializeAuth = async () => {
      console.log('🚀 [AuthProvider] Inicializando autenticación...');
      await refreshAuth();
      setAuthReady(true);
    };
    
    // Configurar listener para cambios en la autenticación
    const setupAuthListener = () => {
      console.log('👂 [AuthProvider] Configurando listener de autenticación');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log(`🔔 [AuthProvider] Evento de autenticación: ${event}`);
        
        if (currentSession) {
          console.log('✅ [AuthProvider] Sesión actualizada:', currentSession.user.id);
          setUser(currentSession.user);
          setSession(currentSession);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [AuthProvider] Usuario cerró sesión');
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        } else {
          // No hay sesión, pero no fue un cierre de sesión explícito
          await refreshAuth(); // Intentar recuperar sesión
        }
      });
      
      // Devolver función para limpiar el listener
      return () => {
        console.log('🧹 [AuthProvider] Limpiando listener de autenticación');
        subscription.unsubscribe();
      };
    };
    
    // Inicializar autenticación y configurar listener
    initializeAuth();
    const cleanup = setupAuthListener();
    
    // Limpiar al desmontar
    return () => {
      cleanup();
    };
  }, [supabase.auth]);
  
  // Debug: mostrar cambios en la ruta
  useEffect(() => {
    console.log('🧭 [AuthProvider] Cambio de ruta:', pathname);
  }, [pathname]);
  
  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated,
      error,
      signOut,
      refreshAuth,
      authReady
    }}>
      {children}
    </AuthContext.Provider>
  );
}
