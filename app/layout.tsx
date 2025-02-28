"use client";
import { useEffect, useState } from "react";
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  // Check if current path is an auth route
  const isAuthRoute = pathname?.startsWith("/auth/") || pathname === "/";

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    };

    checkSession();
  }, [supabase.auth]);

  // Show loading while checking auth status
  if (isAuthenticated === null && !isAuthRoute) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}