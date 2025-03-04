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
    const { script, targetAudience, productType, auth } = requestData;
    
    // Por defecto, asumir que no está autenticado
    let userId = "anonymous";
    let isAuthenticated = false;
    
    // Si recibimos info de auth en la solicitud, usarla
    if (auth?.isAuthenticated) {
      isAuthenticated = auth.isAuthenticated;
      userId = auth.userId;
      console.log("✅ [API/Script] Usuario autenticado desde solicitud:", userId);
    }
    
    // Verificar cookies para autenticación
    try {
      const cookieStore = await cookies();
      
      // Verificar si hay token de autenticación en cookies
      const authCookie = cookieStore.get('sb-eqvlsceuumtwkuagolmv-auth-token');
      
      if (authCookie?.value) {
        console.log("🍪 [API/Script] Se encontró cookie de autenticación");
        
        // Crear cliente Supabase directamente
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
              console.log("✅ [API/Script] Usuario autenticado desde cookie:", userId);
            }
          }
        } catch (parseError) {
          console.error("❌ [API/Script] Error al procesar token:", parseError);
        }
      }
    } catch (cookieError) {
      console.error("❌ [API/Script] Error al acceder a las cookies:", cookieError);
    }

    // Verificar que tenemos un script para analizar
    if (!script) {
      return NextResponse.json({ 
        error: "Script is required",
        authenticated: isAuthenticated,
        userId 
      }, { status: 400 });
    }

    // Procesar la solicitud de análisis
    console.log("📝 [API/Script] Procesando solicitud de análisis de script...");
    console.log("📊 [API/Script] Estado de autenticación:", isAuthenticated ? "Autenticado" : "No autenticado");
    
    // Construir el prompt para el análisis del script
    const prompt = `
Please analyze the following sales script and provide detailed feedback:

${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
${productType ? `PRODUCT/SERVICE TYPE: ${productType}` : ''}

SALES SCRIPT:
${script}

Analyze the persuasiveness, clarity, structure, benefit focus, authenticity, and call-to-action effectiveness of this sales script.
Provide your analysis in the following JSON format:

{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "overall_quality": "A paragraph summarizing the overall quality of the script",
  "persuasiveness_score": numeric_score_between_1_and_10,
  "clarity_score": numeric_score_between_1_and_10,
  "structure_score": numeric_score_between_1_and_10,
  "benefit_focus_score": numeric_score_between_1_and_10,
  "authenticity_score": numeric_score_between_1_and_10,
  "call_to_action_effectiveness": numeric_score_between_1_and_10
}

Include at least 3 strengths, 3 weaknesses, and 3 suggestions. Be specific and actionable in your feedback.
`;

    // Hacer la solicitud a OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert sales coach specializing in script analysis. Your feedback should be honest, detailed and focused on improving persuasiveness and conversion rates.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    // Extraer el contenido de la respuesta
    const content = response.choices[0]?.message?.content || "";

    // Extraer JSON de la respuesta de OpenAI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let analysisResult;

    if (jsonMatch) {
      analysisResult = JSON.parse(jsonMatch[0]);
      // Agregar información sobre la autenticación al resultado
      analysisResult.authenticated = isAuthenticated;
      analysisResult.userId = userId;
      
      console.log(`✅ [API/Script] Análisis completado, usuario ${isAuthenticated ? 'autenticado' : 'no autenticado'}`);
    } else {
      throw new Error("Could not parse response from OpenAI");
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("❌ [API/Script] Error in script analysis API:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze sales script",
        details: error.message
      },
      { status: 500 }
    );
  }
}
