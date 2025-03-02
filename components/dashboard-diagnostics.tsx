"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { checkDatabaseTables, seedUserData } from "@/lib/userDataService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Database, RefreshCw, UserCheck } from "lucide-react";

export function DashboardDiagnostics() {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<any>(null);
  const [tables, setTables] = useState<Record<string, boolean>>({});
  const [cookies, setCookies] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [seedStatus, setSeedStatus] = useState<{done: boolean, message: string}>({done: false, message: ""});
  
  const supabase = createClientComponentClient();
  
  // Load diagnostic data
  useEffect(() => {
    const loadDiagnostics = async () => {
      setLoading(true);
      setDebugInfo("Loading diagnostics...");
      
      try {
        // Check session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setDebugInfo(prev => prev + "\nSession checked: " + (data.session ? "Found" : "Not found"));
        
        // Check tables
        const { exists, error } = await checkDatabaseTables();
        if (error) {
          setDebugInfo(prev => prev + "\nError checking tables: " + error);
        } else {
          setTables(exists);
          setDebugInfo(prev => prev + "\nTables checked: " + Object.keys(exists).length + " tables");
        }
        
        // Check cookies
        if (typeof document !== "undefined") {
          setCookies(document.cookie);
          setDebugInfo(prev => prev + "\nCookies retrieved: " + (document.cookie.length > 0 ? "Yes" : "No"));
        }
      } catch (error: any) {
        setDebugInfo(prev => prev + "\nError in diagnostics: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadDiagnostics();
  }, [supabase]);
  
  // Handle seeding sample data
  const handleSeedData = async () => {
    if (!session?.user?.id) {
      setSeedStatus({done: true, message: "No user session found"});
      return;
    }
    
    try {
      setSeedStatus({done: false, message: "Seeding data..."});
      const result = await seedUserData(session.user.id);
      setSeedStatus({done: true, message: result.message});
      
      if (result.success) {
        // Reload the page after 2 seconds to show the new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      setSeedStatus({done: true, message: "Error: " + error.message});
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> 
          System Diagnostics
        </CardTitle>
        <CardDescription>
          Check system status and database connections
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Session Status */}
        <div className="rounded-md border p-4">
          <div className="flex items-center gap-2">
            {session ? (
              <UserCheck className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <h3 className="font-medium">User Session</h3>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-gray-500"></div>
                <span>Checking session...</span>
              </div>
            ) : session ? (
              <div className="space-y-1">
                <p>Authenticated as: {session.user.email}</p>
                <p className="text-xs text-gray-500">User ID: {session.user.id}</p>
              </div>
            ) : (
              <p className="text-red-500">No active session found</p>
            )}
          </div>
        </div>
        
        {/* Database Tables */}
        <div className="rounded-md border p-4">
          <h3 className="font-medium">Database Tables</h3>
          
          {loading ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-gray-500"></div>
              <span className="text-sm text-gray-600">Checking tables...</span>
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              {Object.entries(tables).map(([table, exists]) => (
                <div key={table} className="flex items-center gap-2 text-sm">
                  {exists ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={exists ? "text-gray-600" : "text-red-500"}>
                    {table}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Debug Info */}
        <div className="rounded-md border p-4">
          <h3 className="font-medium">Debug Information</h3>
          
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-blue-600">Show details</summary>
            <div className="mt-2 space-y-2">
              <div>
                <h4 className="text-xs font-medium text-gray-500">Session Cookie</h4>
                <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                  {cookies || "No cookies found"}
                </pre>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">Debug Log</h4>
                <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap">
                  {debugInfo || "No debug info"}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        
        <div className="flex items-center gap-2">
          {seedStatus.message && (
            <span className={`text-sm ${seedStatus.done ? (seedStatus.message.includes("Error") ? "text-red-500" : "text-green-500") : "text-blue-500"}`}>
              {seedStatus.message}
            </span>
          )}
          <Button 
            size="sm"
            onClick={handleSeedData}
            disabled={!session || loading || seedStatus.message === "Seeding data..."}
          >
            Seed Sample Data
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
