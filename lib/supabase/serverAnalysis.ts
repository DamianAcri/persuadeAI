import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface SaveAnalysisParams {
  userId: string;
  conversation: string;
  context?: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  overall: string;
  score: number;
}

export async function getServerAnalysisService() {
  // Obtener el objeto de cookies directamente
  const cookieStore = cookies();
  // Pasar las cookies como una función que devuelve las cookies
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  return {
    async saveAnalysisResult({
      userId,
      conversation,
      context = "",
      strengths,
      weaknesses,
      tips,
      overall,
      score,
    }: SaveAnalysisParams) {
      try {
        console.log("Inserting analysis result to Supabase...");
        console.log("Parameters:", { userId, conversation, context, strengths, weaknesses, tips, overall, score });

        // Simulación de retraso de 2 segundos (puedes quitarlo en producción)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const { data, error } = await supabase
          .from("analysis_results")
          .insert([
            {
              user_id: userId,
              conversation,
              context,
              strengths,
              weaknesses,
              tips,
              overall,
              score,
              created_at: new Date().toISOString(),
            },
          ])
          .select("id")
          .single();

        if (error) {
          console.error("Error saving analysis result:", error.message);
          throw new Error(`Database insertion failed: ${error.message}`);
        }

        console.log("Analysis result saved successfully:", data);
        return { success: true, resultId: data?.id };
      } catch (error: any) {
        console.error("Error in saveAnalysisResult:", error.message);
        return { success: false, error: error.message };
      }
    },
  };
}
