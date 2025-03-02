import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

// Singleton para el cliente Supabase
let supabaseInstance: SupabaseClient | null = null;

// Obtener o crear el cliente Supabase
export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Si estamos en el servidor, creamos una nueva instancia
    return createClientComponentClient();
  }
 
  // En el cliente, mantener una única instancia
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
   
    // Configurar listener una vez
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log(`🔔 [supabase-browser] Evento auth: ${event}`);
      if (session) {
        console.log('✅ [supabase-browser] Usuario autenticado:', session.user.id);
      } else {
        console.log('❌ [supabase-browser] No hay sesión activa');
      }
    });
  }
 
  return supabaseInstance;
}

// Función para verificar autenticación
export async function checkAuth(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
   
    if (error) {
      console.error('[supabase-browser] Error verificando sesión:', error);
      return {
        isAuthenticated: false,
        user: null,
        session: null,
        error: error.message
      };
    }
   
    return {
      isAuthenticated: !!data.session,
      user: data.session?.user || null,
      session: data.session
    };
  } catch (error: any) {
    console.error('[supabase-browser] Error:', error);
    return {
      isAuthenticated: false,
      user: null,
      session: null,
      error: error.message
    };
  }
}

// Exportar funciones útiles
export const auth = {
  getClient: () => getSupabaseClient().auth,
  signOut: async () => getSupabaseClient().auth.signOut(),
  checkAuth
};