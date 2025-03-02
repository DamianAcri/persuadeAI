// app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Providers } from "./providers";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AppContent>{children}</AppContent>
        </Providers>
      </body>
    </html>
  );
}