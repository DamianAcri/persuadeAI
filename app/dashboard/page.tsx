"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardOverview } from "@/components/dashboard-overview";
import { DatabaseDebug } from "@/components/database-debug";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const [showDebug] = useState(process.env.NODE_ENV !== 'production');

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session, redirecting to login");
          router.push("/auth/login");
          return;
        }
        
        // User is authenticated
        setUserId(session.user.id);
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
  }, [router, supabase.auth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    );
  }

  // Render dashboard once user is authenticated
  return (
    <main>
      <DashboardOverview />
      
      {/* Only show database debug in development */}
      {showDebug && (
        <div className="px-6 pb-6 mt-4">
          <DatabaseDebug />
        </div>
      )}
    </main>
  );
}