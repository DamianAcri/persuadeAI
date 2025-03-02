import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // No es necesario esperar a cookies() ya que no devuelve una promesa
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticación
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    // Verificar que el usuario existe
    const userId = sessionData.session.user.id;
    
    // Comprobar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabase.rpc(
      'table_exists',
      { table_name: 'analysis_results' }
    );
    
    // Si hay error en la función rpc, intentar con otra consulta
    let tableExists = false;
    
    if (tableError) {
      try {
        const { data, error } = await supabase
          .from('analysis_results')
          .select('count(*)', { count: 'exact' })
          .limit(1);
          
        tableExists = !error;
      } catch (err) {
        tableExists = false;
      }
    } else {
      tableExists = tableInfo;
    }
    
    // Intentar una inserción de prueba en la tabla
    const testResult = tableExists ? await performTestInsert(supabase, userId) : null;
    
    return NextResponse.json({
      authenticated: true,
      userId,
      tableExists,
      testResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("Error en debug API:", error);
    
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}

async function performTestInsert(supabase: any, userId: string) {
  try {
    // Datos de prueba
    const testData = {
      user_id: userId,
      conversation: "Conversación de prueba API",
      context: "Contexto de prueba",
      strengths: JSON.stringify(["Fortaleza de prueba 1", "Fortaleza de prueba 2"]),
      weaknesses: JSON.stringify(["Debilidad de prueba 1", "Debilidad de prueba 2"]),
      tips: JSON.stringify(["Consejo de prueba 1", "Consejo de prueba 2"]),
      overall: "Evaluación general de prueba",
      score: 8
    };
    
    // Intentar la inserción
    const { data, error } = await supabase
      .from('analysis_results')
      .insert([testData])
      .select('id')
      .single();
      
    if (error) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      };
    }
    
    return {
      success: true,
      insertedId: data.id
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message
      }
    };
  }
}
