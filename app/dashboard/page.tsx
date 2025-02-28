"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardOverview } from "@/components/dashboard-overview";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session, redirect to login
          console.log("No active session, redirecting to login");
          router.push("/auth/login");
          return;
        }
        
        // User is authenticated, set user data
        setUser(session.user);
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
  return <DashboardOverview />;
}