"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ScriptEvaluation } from "@/components/script-evaluation";

export const metadata = {
  title: "Sales Script Evaluation | PersuadeAI",
  description: "Improve your sales scripts with AI-powered feedback",
};

export default function ScriptsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient();

  // Verificar autenticación tal como en el dashboard
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session, redirecting to login");
          router.push("/auth/login?returnUrl=/scripts");
          return;
        }
        
        // User is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
    
    // Importante: verificar periódicamente la autenticación
    const interval = setInterval(checkSession, 10000);
    return () => clearInterval(interval);
  }, [router, supabase.auth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }
  
  // Si no está autenticado, mostrar mensaje mientras se redirige
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600">You must be logged in to access this page.</p>
        <p className="mt-2 text-gray-500">Redirecting to login page...</p>
      </div>
    );
  }

  // Render content if authenticated
  return <ScriptEvaluation />;
}
