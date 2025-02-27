"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  
  // Create the Supabase client using the recommended method
  const supabase = createClientComponentClient();

  // Check if user is already logged in when the page loads
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If session exists, skip login and redirect to dashboard
        if (session) {
          console.log("User already has an active session, redirecting to dashboard");
          setMessage("You're already logged in. Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, [router, supabase.auth]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Login response:", data);
      
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Logged in successfully! Redirecting...");
        
        // Give Supabase a moment to set the cookies before redirecting
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh(); // Force a refresh to update the navigation state
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  
  // Show a simple loading state while checking authentication
  if (checkingSession) {
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
          Log In to <a className="text-blue-600" href="#">Your SaaS</a>
        </h1>
        <p className="mt-3 text-2xl">
          Please enter your credentials to log in
        </p>
        {message && message.includes("already logged in") ? (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md">
            {message}
          </div>
        ) : (
          <form className="flex flex-col mt-6" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-2 border rounded-md mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-2 border rounded-md mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}
        {message && !message.includes("already logged in") && (
          <p className={`mt-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <p className="mt-4">
          Don't have an account? <Link href="/auth/signup" className="text-blue-600">Sign Up</Link>
        </p>
      </main>
    </div>
  );
}