"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardHeader } from "@/components/analysis-dashboard-header";
import AnalysisForm from "@/app/ai/analysis/components/AnalysisForm";
import { useSearchParams } from "next/navigation";

export default function AnalysisPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const extractedText = searchParams ? searchParams.get("extracted") || "" : "";
  const method = searchParams ? searchParams.get("method") || "paste" : "paste";

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session, redirecting to login");
          router.push("/auth/login?returnUrl=/ai/analysis");
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
    
    const interval = setInterval(checkSession, 10000);
    return () => clearInterval(interval);
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600">You must be logged in to access this page.</p>
        <p className="mt-2 text-gray-500">Redirecting to login page...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader 
        title="Conversation Analysis" 
        description="Upload or paste your sales conversations for AI-powered feedback and insights." 
      />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <AnalysisForm initialConversation={extractedText} initialMethod={method} />
      </main>
    </div>
  );
}