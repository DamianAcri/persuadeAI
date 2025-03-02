import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';
import { cookies } from "next/headers";

// Inicializa OpenAI con la API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Obtener datos de la solicitud primero
    const requestData = await req.json();
    const { conversation, context, auth } = requestData;
    
    // Por defecto, asumir que no está autenticado
    let userId = "anonymous";
    let isAuthenticated = false;
    
    // Si recibimos info de auth en la solicitud, usarla
    if (auth?.isAuthenticated) {
      isAuthenticated = auth.isAuthenticated;
      userId = auth.userId;
      console.log("✅ [API] Usuario autenticado desde solicitud:", userId);
    }
    
    // Este es el bloque que causa el error, lo corregimos
    try {
      // Importante: usar await con cookies() para evitar el error
      const cookieStore = await cookies();
      
      // Verificar si hay token de autenticación en cookies
      const authCookie = cookieStore.get('sb-eqvlsceuumtwkuagolmv-auth-token');
      
      if (authCookie?.value) {
        console.log("🍪 [API] Se encontró cookie de autenticación");
        
        // Crear cliente Supabase directamente en lugar de usar helpers
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        
        try {
          // Intentar analizar el token
          const tokenData = JSON.parse(authCookie.value);
          
          if (Array.isArray(tokenData) && tokenData.length > 0) {
            const accessToken = tokenData[0];
            
            // Crear cliente con el token
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
              },
              global: {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
            });
            
            // Obtener usuario
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (!userError && userData?.user) {
              isAuthenticated = true;
              userId = userData.user.id;
              console.log("✅ [API] Usuario autenticado desde cookie:", userId);
            }
          }
        } catch (parseError) {
          console.error("❌ [API] Error al procesar token:", parseError);
        }
      }
    } catch (cookieError) {
      console.error("❌ [API] Error al acceder a las cookies:", cookieError);
    }

    if (!conversation) {
      return NextResponse.json({ 
        error: "Conversation is required",
        authenticated: isAuthenticated,
        userId 
      }, { status: 400 });
    }

    // Procesar la solicitud de análisis
    console.log("📝 [API] Procesando solicitud de análisis...");
    console.log("📊 [API] Estado de autenticación:", isAuthenticated ? "Autenticado" : "No autenticado");
    
    const prompt = `
Please analyze the following sales/persuasion conversation and provide feedback:
CONTEXT:
${context || "No additional context provided."}
CONVERSATION:
${conversation}
Please provide your analysis in the following JSON format:
{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "tips": ["tip1", "tip2", ...],
  "overall": "overall assessment",
  "score": numeric_score_between_1_and_10,
  "objection_handling": numeric_score_between_1_and_10,
  "active_listening": numeric_score_between_1_and_10,
  "value_proposition": numeric_score_between_1_and_10,
  "closing_techniques": numeric_score_between_1_and_10
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in sales and persuasion techniques. Analyze the conversation and provide detailed feedback. Be as blunt as possible.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";

    // Extraer JSON de la respuesta de OpenAI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let analysisResult;

    if (jsonMatch) {
      analysisResult = JSON.parse(jsonMatch[0]);
      // Agregar información sobre la autenticación al resultado
      analysisResult.authenticated = isAuthenticated;
      analysisResult.userId = userId;
      
      console.log(`✅ [API] Análisis completado, usuario ${isAuthenticated ? 'autenticado' : 'no autenticado'}`);
    } else {
      throw new Error("Could not parse response");
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("❌ [API] Error in analysis API:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze conversation",
        details: error.message
      },
      { status: 500 }
    );
  }
}
