"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
        
        // If session exists, notify the user and provide option to go to dashboard
        if (session) {
          console.log("User already has an active session");
          setMessage("existing-user");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, [supabase.auth]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      // Proceed with sign up - Supabase will automatically handle existing email cases
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (error) {
        // This will catch the case when the email is already registered
        if (error.message.includes("already registered")) {
          setMessage("An account with this email already exists. Please log in instead.");
        } else {
          setMessage(error.message);
        }
      } else {
        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          setMessage("An account with this email already exists. Please log in instead.");
        } else {
          setMessage("success");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToDashboard() {
    router.push("/dashboard");
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
          Sign Up for <a className="text-blue-600" href="#">Your SaaS</a>
        </h1>
        <p className="mt-3 text-2xl">Create an account to get started</p>
        
        {/* Already logged in message */}
        {message === "existing-user" ? (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold text-blue-700 mb-2">You're Already Signed In</h2>
            <p className="mb-4">It looks like you already have an active session. You don't need to create a new account.</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={goToDashboard}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Go to Dashboard
              </button>
              <Link href="/auth/login" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Switch Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Registration success message */}
            {message === "success" ? (
              <div className="mt-6 p-6 bg-green-50 rounded-lg max-w-md mx-auto">
                <h2 className="text-xl font-bold text-green-700 mb-2">Account Created Successfully!</h2>
                <p className="mb-4">Please check your email for a confirmation link to activate your account.</p>
                <Link href="/auth/login" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                  Proceed to Login
                </Link>
              </div>
            ) : (
              <>
                {/* Registration form */}
                <form className="flex flex-col mt-6" onSubmit={handleSignUp}>
                  <input
                    type="text"
                    placeholder="Username"
                    className="px-4 py-2 border rounded-md mb-4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
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
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </button>
                </form>
              </>
            )}
            
            {/* Error message */}
            {message && message !== "success" && message !== "existing-user" && (
              <p className="mt-4 text-red-600">{message}</p>
            )}
          </>
        )}
        
        <p className="mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </main>
    </div>
  );
}