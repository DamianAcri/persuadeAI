import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crear cliente con configuración simple
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Función para analizar directamente las cookies en el navegador
export const getSessionFromCookies = () => {
  if (typeof document === 'undefined') return null;
  
  try {
    // Buscar la cookie de autenticación de Supabase
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
    const authCookieStr = cookies.find(cookie => cookie.startsWith('sb-eqvlsceuumtwkuagolmv-auth-token='));
    
    if (!authCookieStr) {
      console.log('🍪 No se encontró la cookie de autenticación');
      return null;
    }
    
    console.log('🍪 Cookie de autenticación encontrada');
    
    // Decodificar el valor de la cookie
    const encodedCookie = authCookieStr.substring('sb-eqvlsceuumtwkuagolmv-auth-token='.length);
    const decodedCookie = decodeURIComponent(encodedCookie);
    
    // Extraer el token JWT
    try {
      // La cookie tiene formato de array JSON
      const parsedArray = JSON.parse(decodedCookie);
      
      // El primer elemento es el token JWT
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        const jwtToken = parsedArray[0];
        
        // Decodificar el payload del JWT (segunda parte del token)
        const parts = jwtToken.split('.');
        if (parts.length === 3) {
          // Decodificar la parte del payload (segunda parte)
          const payloadBase64 = parts[1];
          const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(payloadJson);
          
          console.log('✅ Token JWT decodificado correctamente');
          console.log('👤 Usuario:', payload.sub);
          console.log('📧 Email:', payload.email);
          console.log('⏰ Expira:', new Date(payload.exp * 1000).toLocaleString());
          
          return {
            user: {
              id: payload.sub,
              email: payload.email,
              // Otras propiedades necesarias...
            },
            access_token: jwtToken,
            // Otras propiedades necesarias...
          };
        }
      }
    } catch (parseError) {
      console.error('❌ Error al analizar la cookie de autenticación:', parseError);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error al leer las cookies:', error);
    return null;
  }
};

// Función para verificar la sesión - con respaldo de cookie directa
export const checkSupabaseSession = async () => {
  try {
    // Intentar obtener la sesión a través de la API de Supabase
    const { data, error } = await supabase.auth.getSession();
    let hasSession = !!data.session;
    let userId = data.session?.user?.id;
    
    console.log(`🔍 [supabaseCliente] Sesión API: ${hasSession ? 'Activa ✅' : 'Inactiva ❌'}`);
    
    // Si no hay sesión a través de la API, intentar leer directamente de las cookies
    if (!hasSession && typeof window !== 'undefined') {
      console.log('🔍 [supabaseCliente] Intentando obtener sesión desde cookies...');
      const cookieSession = getSessionFromCookies();
      
      if (cookieSession) {
        hasSession = true;
        userId = cookieSession.user.id;
        console.log(`🔍 [supabaseCliente] Sesión desde cookies: Activa ✅ (${userId})`);
      }
    }
    
    // Si aún no hay sesión, depurar más información
    if (!hasSession) {
      console.log('⚠️ [supabaseCliente] No se pudo obtener una sesión válida');
      
      // Intentar leer las cookies directamente para depuración
      if (typeof document !== 'undefined') {
        console.log('🍪 [supabaseCliente] Cookies actuales:', document.cookie);
      }
    }
    
    return { 
      hasSession,
      userId,
      error: error?.message
    };
  } catch (error: any) {
    console.error('❌ [supabaseCliente] Error al verificar sesión:', error);
    return { hasSession: false, userId: null, error: error.message };
  }
};

// Crear un hook simple para usar en componentes
export const useSupabaseSession = () => {
  if (typeof window !== 'undefined') {
    return checkSupabaseSession();
  }
  return Promise.resolve({ hasSession: false, userId: null, error: 'Ejecutando en servidor' });
};

// Inicializar listener de autenticación solo en el cliente
if (typeof window !== 'undefined') {
  console.log('🔄 [supabaseCliente] Configurando listener de autenticación');
  
  // Verificar sesión inicial
  checkSupabaseSession()
    .then(({ hasSession }) => {
      console.log(`🚀 [supabaseCliente] Estado inicial: ${hasSession ? 'Autenticado' : 'No autenticado'}`);
    })
    .catch(err => {
      console.error('❌ [supabaseCliente] Error en verificación inicial:', err);
    });
  
  // Configurar listener para cambios de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`🔔 [supabaseCliente] Evento: ${event}`);
    console.log(`👤 [supabaseCliente] Usuario actual: ${session ? session.user.id : 'Ninguno'}`);
  });
}

export { getSessionFromCookies as getSessionFromCookie };