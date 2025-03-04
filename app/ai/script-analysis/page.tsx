"use client";

import { DashboardHeader } from "@/components/analysis-dashboard-header";
import ScriptAnalysisForm from "@/app/ai/script-analysis/components/ScriptAnalysisForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ScriptAnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialScript = searchParams ? searchParams.get("script") || "" : "";
  
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const handleLoginRedirect = () => {
    router.push('/auth/login?returnUrl=/ai/script-analysis');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader 
        title="Sales Script Analysis" 
        description="Analyze your sales scripts to get AI-powered feedback on persuasiveness and effectiveness." 
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
                  <p>Tus análisis de scripts se guardarán en tu cuenta</p>
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
        <ScriptAnalysisForm initialScript={initialScript} />
      </main>
      
      {/* Feature description section */}
      <section className="bg-gray-50 py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Optimize Your Sales Scripts with AI
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3 text-blue-600">What We Analyze</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Persuasiveness and clarity of your message
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Structure and flow of your sales arguments
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Focus on benefits vs. features
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Authenticity and trust-building elements
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Call-to-action effectiveness
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3 text-green-600">What You'll Get</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Detailed scoring across 5 key performance metrics
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Identified strengths in your current script
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Areas for improvement and optimization
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Actionable suggestions to enhance persuasiveness
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Save and track your script improvements over time
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg mt-8 border border-blue-100">
              <h3 className="font-semibold text-lg mb-2 text-blue-700">Pro Tip</h3>
              <p className="text-gray-700">
                For the most accurate analysis, include your complete sales script with introduction, 
                key talking points, objection handling, and closing statements. Adding information about 
                your target audience and product type will further enhance the analysis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
