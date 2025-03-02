"use client";

import { DashboardHeader } from "@/components/analysis-dashboard-header";
import AnalysisForm from "@/app/ai/analysis/components/AnalysisForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const extractedText = searchParams ? searchParams.get("extracted") || "" : "";
  const method = searchParams ? searchParams.get("method") || "paste" : "paste";
  
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const handleLoginRedirect = () => {
    router.push('/auth/login?returnUrl=/ai/analysis');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader 
        title="Conversation Analysis" 
        description="Upload or paste your sales conversations for AI-powered feedback and insights." 
      />
      
      {/* Banner de estado de autenticación */}
      {!isLoading && (
        <div className={`mx-4 mt-4 p-4 rounded-lg ${isAuthenticated ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              {isAuthenticated ? (
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${isAuthenticated ? 'text-green-800' : 'text-yellow-800'}`}>
                {isAuthenticated 
                  ? `Autenticado como ${user?.email || user?.id}` 
                  : 'No estás autenticado'}
              </h3>
              <div className={`mt-1 text-sm ${isAuthenticated ? 'text-green-700' : 'text-yellow-700'}`}>
                {isAuthenticated ? (
                  <p>Tus análisis se guardarán en tu cuenta</p>
                ) : (
                  <p>
                    No podrás guardar tus análisis. 
                    <span className="ml-1 underline cursor-pointer" onClick={handleLoginRedirect}>
                      Iniciar sesión
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <AnalysisForm initialConversation={extractedText} initialMethod={method} />
      </main>
    </div>
  );
}