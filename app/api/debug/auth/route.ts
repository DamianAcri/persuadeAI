import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // Primero esperamos el resultado de cookies()
    const cookieStore = await cookies();
   
    // Trabajamos con el cookieStore como antes
    const allCookies = cookieStore.getAll();
    const cookieNames = allCookies.map(cookie => cookie.name);
   
    console.log('🍪 [Debug Auth] Cookies disponibles:', cookieNames);
   
    // Buscar específicamente la cookie de autenticación
    const authCookie = cookieStore.get('sb-eqvlsceuumtwkuagolmv-auth-token');
   
    // Crear el cliente de Supabase usando una sintaxis diferente que satisface
    // los tipos esperados por TypeScript
    const supabase = createRouteHandlerClient({ cookies });
   
    // Verificar sesión con Supabase
    const { data, error } = await supabase.auth.getSession();
   
    if (error) {
      console.error('❌ [Debug Auth] Error verificando sesión:', error.message);
     
      return NextResponse.json({
        status: "error",
        message: "Error verificando sesión",
        error: error.message,
        hasCookie: !!authCookie,
        cookieNames
      });
    }
   
    if (!data.session) {
      console.log('ℹ️ [Debug Auth] No hay sesión activa en Supabase');
     
      return NextResponse.json({
        status: "unauthorized",
        message: "No hay sesión activa",
        hasCookie: !!authCookie,
        cookieNames
      });
    }
   
    // Sesión encontrada
    const userId = data.session.user.id;
    const email = data.session.user.email;
    const expires_at = data.session.expires_at;
   
    // Calcular tiempo restante de la sesión
    let expiresIn = null;
    if (expires_at) {
      const expirationDate = new Date(expires_at * 1000);
      const now = new Date();
      expiresIn = Math.round((expirationDate.getTime() - now.getTime()) / (60 * 1000));
    }
   
    return NextResponse.json({
      status: "authenticated",
      message: "Usuario autenticado",
      userId,
      email,
      expiresIn: expiresIn !== null ? `${expiresIn} minutos` : null,
      hasCookie: !!authCookie,
      cookieNames
    });
   
  } catch (error: any) {
    console.error('❌ [Debug Auth] Error:', error);
   
    return NextResponse.json({
      status: "error",
      message: "Error interno",
      error: error.message
    }, { status: 500 });
  }
}