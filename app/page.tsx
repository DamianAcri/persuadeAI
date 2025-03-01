"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClientComponentClient();

  // Check if user is already logged in when the page loads
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If session exists, user is already logged in
        if (session) {
          console.log("User already has an active session, redirecting to dashboard");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkSession();
  }, [router, supabase.auth]);

  // Show a simple loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <a className="text-blue-600" href="#">FHDSOIFHIS</a>
        </h1>
        <p className="mt-3 text-2xl">
          Get started by signing up or logging in
        </p>
        <div className="flex mt-6">
          <Link href="/auth/signup" className="px-4 py-2 bg-blue-500 text-white rounded-md">Sign Up</Link>
          <Link href="/auth/login" className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-md">Log In</Link>
        </div>
      </main>
      <footer className="w-full h-24 flex items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <Image src="/next.svg" alt="Next.js Logo" width={72} height={16} />
        </a>
      </footer>
    </div>
  );
}