// lib/supabase/analysis.ts

import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

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

// Function for client components
export function useAnalysisService() {
  const supabase = createSupabaseClient();
  const { user } = useAuth();
  
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
        console.log('📝 [analysis] Starting analysis save...');
        
        // Determine final user ID
        let finalUserId = userId || user?.id;
        
        // If no user ID, we can't save
        if (!finalUserId) {
          console.error('❌ [analysis] No user ID to save');
          return { 
            success: false, 
            error: 'You must be logged in to save analysis'
          };
        }
        
        console.log('📊 [analysis] Preparing data for user:', finalUserId);
        
        // Convert arrays to JSON string format for Postgres compatibility
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

        console.log('🧪 [analysis] Verifying data structure to insert:', {
          user_id: finalUserId,
          // Show first characters to avoid very large logs
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
        
        // Perform database insertion
        const { data, error } = await supabase
          .from('analysis_results')
          .insert([analysisData])
          .select('id')
          .single();
       
        if (error) {
          console.error('❌ [analysis] Supabase error:', error);
          console.error('❌ [analysis] Error code:', error.code);
          console.error('❌ [analysis] Details:', error.details);
          console.error('❌ [analysis] Message:', error.message);
          
          // Handle specific errors
          if (error.code === '23503') {
            return { 
              success: false, 
              error: 'Foreign key error: User does not exist in database'
            };
          }
          
          if (error.code === '23505') {
            return { 
              success: false, 
              error: 'This analysis already exists in the database'
            };
          }
          
          if (error.code === '42P01') {
            return { 
              success: false, 
              error: 'The analysis_results table does not exist. Verify database structure.'
            };
          }
          
          return { 
            success: false, 
            error: `Database error: ${error.message}`
          };
        }
       
        if (!data) {
          console.error('❌ [analysis] No data received from insertion');
          return { 
            success: false, 
            error: 'Record created but could not get its ID'
          };
        }
        
        console.log('✅ [analysis] Analysis saved successfully with ID:', data.id);
        return { success: true, resultId: data.id };
      } catch (error: any) {
        console.error('❌ [analysis] Exception during save:', error);
        return {
          success: false,
          error: error.message || 'Unknown error saving analysis'
        };
      }
    },
    
    // Rest of functions
    async getUserAnalysisHistory() {
      try {
        console.log('📊 [analysis] Getting history...');
        
        // Use the user from auth context
        if (!user?.id) {
          console.error('❌ [analysis] No authenticated user to get history');
          return [];
        }
        
        const userId = user.id;
        console.log('👤 [analysis] Getting history for user:', userId);
        
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
       
        if (error) {
          console.error('❌ [analysis] Error getting history:', error);
          throw error;
        }
       
        console.log('✅ [analysis] History obtained:', data.length, 'results');
        return data;
      } catch (error) {
        console.error('❌ [analysis] Error in getUserAnalysisHistory:', error);
        throw error;
      }
    },
   
    async getAnalysisResult(resultId: number) {
      try {
        // Use the user from auth context
        if (!user?.id) {
          console.error('❌ [analysis] No authenticated user to get result');
          throw new Error('Authentication required');
        }
        
        console.log('Getting analysis result for resultId:', resultId, 'and userId:', user.id);
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('id', resultId)
          .eq('user_id', user.id)
          .single();
         
        if (error) {
          console.error('Error getting analysis result:', error);
          throw error;
        }
       
        console.log('Analysis result obtained successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in getAnalysisResult:', error);
        throw error;
      }
    }
  };
}