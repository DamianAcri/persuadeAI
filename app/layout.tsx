"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Providers } from "./providers";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const inter = Inter({ subsets: ["latin"] });

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Check if current path is an auth route
  const isAuthRoute = pathname?.startsWith("/auth/") || pathname === "/";

  // Show loading while checking auth status
  if (isLoading && !isAuthRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {isAuthRoute || !isAuthenticated ? (
        // Auth layout (no header/sidebar)
        <div className="relative min-h-screen">
          {children}
        </div>
      ) : (
        // App layout (with header/sidebar)
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state changed:", event);
        
        // Handle auth events as needed
        if (event === 'SIGNED_OUT') {
          console.log("👋 User signed out, redirecting to home");
          window.location.href = "/";
        }
      }
    );
    
    // Initial auth check
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("🔍 Initial auth check:", data.session ? "Authenticated" : "Not authenticated");
      setAuthChecked(true);
    };
    
    checkAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Always render the HTML and body tags, even while loading
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {/* Show loading indicator or the actual content */}
          {!authChecked ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AppContent>{children}</AppContent>
          )}
        </Providers>
      </body>
    </html>
  );
}