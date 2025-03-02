"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Database, RefreshCw } from "lucide-react";

export function DatabaseDebug() {
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  
  const supabase = createClientComponentClient();
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const checkDatabase = async () => {
    setLoading(true);
    setLogs([]);
    addLog("Checking database...");
    
    try {
      // Check user session
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      setSessionActive(hasSession);
      
      if (hasSession) {
        setUserId(data.session.user.id);
        addLog(`Session found for user: ${data.session.user.id}`);
      } else {
        addLog("No active session found");
      }
      
      // Check if analysis_results table exists
      try {
        const { data: tableData, count, error } = await supabase
          .from('analysis_results')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          addLog(`Error checking table: ${error.message}`);
          setTableExists(false);
        } else {
          addLog(`Table exists with ${count} rows`);
          setTableExists(true);
          setRowCount(count || 0);
        }
      } catch (e: any) {
        addLog(`Exception checking table: ${e.message}`);
        setTableExists(false);
      }
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkDatabase();
  }, []);
  
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Status
        </CardTitle>
        <CardDescription>
          Check connection to the analysis_results table
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <span>Session Status:</span>
          <span className={sessionActive === null ? "text-gray-500" : sessionActive ? "text-green-600" : "text-red-600"}>
            {sessionActive === null ? "Checking..." : sessionActive ? "Active" : "Inactive"}
          </span>
        </div>
        
        <div className="flex items-center justify-between border-b pb-2">
          <span>User ID:</span>
          <span className="text-gray-600 font-mono text-xs">{userId || "None"}</span>
        </div>
        
        <div className="flex items-center justify-between border-b pb-2">
          <span>analysis_results table:</span>
          <span className={tableExists === null ? "text-gray-500" : tableExists ? "text-green-600" : "text-red-600"}>
            {tableExists === null ? "Checking..." : tableExists ? `Exists (${rowCount} rows)` : "Not found"}
          </span>
        </div>
        
        <div className="bg-gray-50 p-2 rounded-md">
          <h3 className="text-xs font-semibold mb-1">Log:</h3>
          <div className="max-h-32 overflow-y-auto text-xs">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-600">{log}</div>
            ))}
          </div>
        </div>
        
        {!tableExists && tableExists !== null && (
          <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Missing Table</h3>
              <p className="text-xs text-red-700 mt-1">
                The analysis_results table doesn't exist or can't be accessed. This will prevent data from displaying in the dashboard.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={checkDatabase} 
          disabled={loading} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Checking..." : "Check Again"}
        </Button>
      </CardFooter>
    </Card>
  );
}
