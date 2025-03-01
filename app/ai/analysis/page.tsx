// app/ai/analysis/page.tsx
"use client"

import { DashboardHeader } from "@/components/analysis-dashboard-header";
import AnalysisForm from "@/app/ai/analysis/components/AnalysisForm";
import { useSearchParams } from "next/navigation";

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const extractedText = searchParams.get("extracted") || "";
  const method = searchParams.get("method") || "paste";

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