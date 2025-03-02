"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CREATE_USER_STATS_TABLE, 
  CREATE_USER_ACTIVITIES_TABLE, 
  CREATE_USER_PERFORMANCE_TABLE 
} from "@/lib/create-table-sql";
import { AlertCircle, Check, Database, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<{[key: string]: {success: boolean, message: string}}>({});
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  async function createTable(tableName: string, sqlStatement: string) {
    setIsLoading(true);
    
    try {
      // First check if table exists
      const { error: checkError } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      // If the table already exists, no need to create it
      if (!checkError) {
        setResults(prev => ({
          ...prev,
          [tableName]: { success: true, message: `Table ${tableName} already exists` }
        }));
        return;
      }
      
      // Try to create the table using RPC if available
      try {
        const { error: rpcError } = await supabase.rpc(`create_${tableName}_table`);
        
        if (!rpcError) {
          setResults(prev => ({
            ...prev,
            [tableName]: { success: true, message: `Successfully created ${tableName} using RPC` }
          }));
          return;
        }
        
        // If RPC fails, try direct SQL execution
        const { error: sqlError } = await supabase.rpc('execute_sql', { sql: sqlStatement });
        
        if (sqlError) {
          setResults(prev => ({
            ...prev,
            [tableName]: { success: false, message: `SQL execution error: ${sqlError.message}` }
          }));
        } else {
          setResults(prev => ({
            ...prev,
            [tableName]: { success: true, message: `Successfully created ${tableName} using SQL` }
          }));
        }
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          [tableName]: { success: false, message: `Error: ${error.message}` }
        }));
      }
    } catch (error: any) {
      setError(`Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function setupAllTables() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create tables in sequence
      await createTable('user_stats', CREATE_USER_STATS_TABLE);
      await createTable('user_activities', CREATE_USER_ACTIVITIES_TABLE);
      await createTable('user_performance', CREATE_USER_PERFORMANCE_TABLE);
    } catch (error: any) {
      setError(`Failed to set up tables: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            <CardTitle>Database Setup</CardTitle>
          </div>
          <CardDescription>
            Create necessary tables for the application to function properly.
            This should be run by an administrator or database owner.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>User Stats Table</span>
              {results.user_stats ? (
                results.user_stats.success ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    {results.user_stats.message}
                  </span>
                ) : (
                  <span className="text-red-600 text-sm">{results.user_stats.message}</span>
                )
              ) : (
                <span className="text-gray-400 text-sm">Not checked</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>User Activities Table</span>
              {results.user_activities ? (
                results.user_activities.success ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    {results.user_activities.message}
                  </span>
                ) : (
                  <span className="text-red-600 text-sm">{results.user_activities.message}</span>
                )
              ) : (
                <span className="text-gray-400 text-sm">Not checked</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>User Performance Table</span>
              {results.user_performance ? (
                results.user_performance.success ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    {results.user_performance.message}
                  </span>
                ) : (
                  <span className="text-red-600 text-sm">{results.user_performance.message}</span>
                )
              ) : (
                <span className="text-gray-400 text-sm">Not checked</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={setupAllTables} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Setup Database Tables
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>
              <strong>Note:</strong> This operation requires database owner privileges or the presence
              of the necessary SQL functions in your Supabase project. If you see permission errors,
              you may need to create the tables manually using the SQL editor in the Supabase dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
