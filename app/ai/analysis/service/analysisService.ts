import { supabase, checkSupabaseSession } from '@/lib/supabase';

// app/ai/analysis/service/analysisService.ts
interface AnalysisParams {
  conversation: string;
  context?: string;
}

// Función para analizar directamente las cookies en el navegador
const getSessionFromCookies = () => {
  if (typeof document === 'undefined') return null;
  
  try {
    // Buscar la cookie de autenticación de Supabase
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
    const authCookieStr = cookies.find(cookie => cookie.startsWith('sb-eqvlsceuumtwkuagolmv-auth-token='));
    
    if (!authCookieStr) {
      console.log('🍪 [analysisService] No se encontró cookie de autenticación');
      return null;
    }
    
    console.log('🍪 [analysisService] Cookie de autenticación encontrada');
    
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
          
          return {
            user: {
              id: payload.sub,
              email: payload.email,
            },
            access_token: jwtToken,
          };
        }
      }
    } catch (parseError) {
      console.error('❌ [analysisService] Error al analizar cookie:', parseError);
    }
    
    return null;
  } catch (error) {
    console.error('❌ [analysisService] Error al leer cookies:', error);
    return null;
  }
};

export async function analyzeConversation({ conversation, context }: AnalysisParams) {
  try {
    console.log('🔍 [analysisService] Verificando sesión antes de análisis...');
    
    // Intentar obtener la sesión por múltiples métodos
    const { hasSession, userId } = await checkSupabaseSession();
    const cookieSession = getSessionFromCookies();
    
    // Determinar si hay autenticación por cualquier método
    const isAuthenticated = hasSession || !!cookieSession;
    const finalUserId = userId || cookieSession?.user?.id;
    
    console.log(`🔐 [analysisService] Estado final: ${isAuthenticated ? 'Autenticado ✅' : 'No autenticado ❌'}`);
    if (finalUserId) {
      console.log(`👤 [analysisService] Usuario: ${finalUserId}`);
    }

    // Incluir token de autenticación si está disponible
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Si hay token en la sesión de cookie, incluirlo en la solicitud
    if (cookieSession?.access_token) {
      headers['Authorization'] = `Bearer ${cookieSession.access_token}`;
      console.log('🔒 [analysisService] Utilizando token de cookie para autenticación');
    } else if (isAuthenticated) {
      // Intentar obtener el token de Supabase
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
          console.log('🔒 [analysisService] Utilizando token de Supabase para autenticación');
        }
      } catch (authError) {
        console.error('❌ [analysisService] Error al obtener token:', authError);
      }
    }

    // Hacer la solicitud a la API
    console.log('📤 [analysisService] Enviando solicitud de análisis...');
    
    const response = await fetch('/api/ai/analysis', {
      method: 'POST',
      headers,
      credentials: 'include', // Importante para enviar cookies
      body: JSON.stringify({ 
        conversation, 
        context,
        // Incluir información de autenticación en el cuerpo también
        auth: {
          isAuthenticated,
          userId: finalUserId || 'anonymous'
        }
      }),
    });

    // Verificar respuesta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Error en la solicitud de análisis');
    }

    // Procesar resultado
    const result = await response.json();
    
    console.log('📥 [analysisService] Respuesta recibida');
    
    return result;
  } catch (error: any) {
    console.error('❌ [analysisService] Error en análisis:', error);
    throw new Error(`Error al analizar conversación: ${error.message}`);
  }
}