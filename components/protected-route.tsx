"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("🔒 Protected route: No active session, redirecting to login");
          // Add current path as returnUrl query parameter for redirect after login
          const currentPath = window.location.pathname;
          const redirectPath = `${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`;
          router.push(redirectPath);
          return;
        }
        
        // User is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Error checking authentication:", error);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
    
    // Importante: asegurar la verificación periódica de autenticación
    const interval = setInterval(checkAuth, 30000); // Verificar cada 30 segundos
    
    return () => clearInterval(interval);
  }, [router, supabase.auth, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-gray-600">Verifying your session...</p>
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

  // If authenticated, render children
  return <>{children}</>;
}
