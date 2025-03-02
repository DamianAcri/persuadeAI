import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface SaveAnalysisParams {
  userId?: string;
  conversation: string;
  context?: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  overall: string;
  score: number;
  objection_handling: number;
  active_listening: number;
  value_proposition: number;
  closing_techniques: number;
}

// Función para usar en componentes del cliente
export function useAnalysisService() {
  const supabase = createClientComponentClient<Database>();
  
  return {
    async saveAnalysisResult({
      userId,
      conversation,
      context = '',
      strengths,
      weaknesses,
      tips,
      overall,
      score,
      objection_handling,
      active_listening,
      value_proposition,
      closing_techniques
    }: SaveAnalysisParams) {
      try {
        console.log('📝 [analysis] Iniciando guardado de análisis...');
        
        // Verificar sesión antes de intentar guardar
        const { data: sessionData } = await supabase.auth.getSession();
        
        // Determinar el ID de usuario final
        let finalUserId = userId;
        if (!finalUserId && sessionData?.session?.user) {
          finalUserId = sessionData.session.user.id;
          console.log('👤 [analysis] Usando ID de usuario de la sesión:', finalUserId);
        }
        
        // Si no hay ID de usuario, no podemos guardar
        if (!finalUserId) {
          console.error('❌ [analysis] No hay ID de usuario para guardar');
          return { 
            success: false, 
            error: 'Debes iniciar sesión para guardar el análisis'
          };
        }
        
        console.log('📊 [analysis] Preparando datos para usuario:', finalUserId);
        
        // Convertir arrays a formato JSON string para compatibilidad con Postgres
        const analysisData = {
          user_id: finalUserId,
          conversation,
          context: context || '',
          strengths: JSON.stringify(strengths),
          weaknesses: JSON.stringify(weaknesses),
          tips: JSON.stringify(tips),
          overall,
          score,
          // Add new metrics
          objection_handling,
          active_listening,
          value_proposition,
          closing_techniques,
          created_at: new Date().toISOString()
        };

        console.log('🧪 [analysis] Verificando estructura de datos a insertar:', {
          user_id: finalUserId,
          // Mostrar primeros caracteres para evitar logs muy grandes
          conversation: conversation.substring(0, 50) + '...',
          context: (context || '').substring(0, 50) + '...',
          strengths_count: strengths.length,
          weaknesses_count: weaknesses.length,
          tips_count: tips.length,
          score,
          objection_handling,
          active_listening,
          value_proposition,
          closing_techniques
        });
        
        // Realizar la inserción en la base de datos con tiempo de espera más largo
        const { data, error } = await supabase
          .from('analysis_results')
          .insert([analysisData])
          .select('id')
          .single();
       
        if (error) {
          console.error('❌ [analysis] Error de Supabase:', error);
          console.error('❌ [analysis] Código de error:', error.code);
          console.error('❌ [analysis] Detalles:', error.details);
          console.error('❌ [analysis] Mensaje:', error.message);
          
          // Manejar errores específicos
          if (error.code === '23503') {
            return { 
              success: false, 
              error: 'Error de clave foránea: El usuario no existe en la base de datos'
            };
          }
          
          if (error.code === '23505') {
            return { 
              success: false, 
              error: 'Este análisis ya existe en la base de datos'
            };
          }
          
          if (error.code === '42P01') {
            return { 
              success: false, 
              error: 'La tabla analysis_results no existe. Verifica la estructura de la base de datos.'
            };
          }
          
          return { 
            success: false, 
            error: `Error de base de datos: ${error.message}`
          };
        }
       
        if (!data) {
          console.error('❌ [analysis] No se recibieron datos de la inserción');
          return { 
            success: false, 
            error: 'Se creó el registro pero no se pudo obtener su ID'
          };
        }
        
        console.log('✅ [analysis] Análisis guardado exitosamente con ID:', data.id);
        return { success: true, resultId: data.id };
      } catch (error: any) {
        console.error('❌ [analysis] Excepción durante el guardado:', error);
        return {
          success: false,
          error: error.message || 'Error desconocido al guardar análisis'
        };
      }
    },
    
    // Resto de funciones igual
    async getUserAnalysisHistory() {
      try {
        console.log('📊 [analysis] Obteniendo historial...');
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          console.error('❌ [analysis] No hay usuario autenticado para obtener historial');
          return [];
        }
        
        const userId = sessionData.session.user.id;
        console.log('👤 [analysis] Obteniendo historial para usuario:', userId);
        
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
       
        if (error) {
          console.error('❌ [analysis] Error al obtener historial:', error);
          throw error;
        }
       
        console.log('✅ [analysis] Historial obtenido:', data.length, 'resultados');
        return data;
      } catch (error) {
        console.error('❌ [analysis] Error en getUserAnalysisHistory:', error);
        throw error;
      }
    },
   
    async getAnalysisResult(resultId: number, userId: string) {
      try {
        console.log('Obteniendo resultado de análisis para resultId:', resultId, 'y userId:', userId);
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('id', resultId)
          .eq('user_id', userId)
          .single();
         
        if (error) {
          console.error('Error al obtener resultado de análisis:', error);
          throw error;
        }
       
        console.log('Resultado de análisis obtenido exitosamente:', data);
        return data;
      } catch (error) {
        console.error('Error en getAnalysisResult:', error);
        throw error;
      }
    }
  };
}