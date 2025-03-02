import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Creates a Supabase RPC function to check if a table exists
 */
export async function setupDatabaseHelpers() {
  const supabase = createClientComponentClient();
  
  try {
    // Create RPC function to get a list of tables
    await supabase.rpc('create_table_list_function', {}, {
      count: 'exact'
    });
    
    // Create RPC function to create the analysis_results table
    await supabase.rpc('create_analysis_results_table_function', {}, {
      count: 'exact'
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to setup database helpers:", error);
    return { success: false, error };
  }
}

/**
 * Fallback method if the analysis_results table doesn't exist
 */
export async function createFallbackAnalysisResults(userId: string) {
  const supabase = createClientComponentClient();
  
  // Create sample data
  const now = new Date();
  const sampleData = [
    {
      user_id: userId,
      conversation: "Sample sales conversation - Fallback data",
      overall: "This is simulated data since the table is unavailable",
      score: 7.5,
      objection_handling: 8.2,
      active_listening: 7.0,
      value_proposition: 6.8,
      closing_techniques: 5.5,
      created_at: new Date(now.getTime() - 3600000 * 24 * 10).toISOString(), // 10 days ago
      strengths: ["Good pacing", "Clear explanations"],
      weaknesses: ["Could improve closing", "Sometimes interrupted client"],
      tips: ["Practice open-ended questions", "Work on summarizing client needs"]
    }
  ];
  
  try {
    // Try to insert to see if table exists
    const { error } = await supabase
      .from('analysis_results')
      .insert({
        user_id: userId,
        conversation: JSON.stringify(sampleData[0]),
        overall: "Fallback data",
        score: 5,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Unable to create fallback data:", error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error creating fallback data:", error);
    return { success: false, error };
  }
}

/**
 * Get browser-compatible, in-memory fallback data
 */
export function getLocalFallbackData(userId: string) {
  const now = new Date();
  
  // Create sample activities
  const activities = [
    {
      id: "local-1",
      user_id: userId,
      type: "analysis",
      title: "Local Sample: Sales call with client",
      score: 82,
      created_at: new Date(now.getTime() - 172800000).toISOString() // 2 days ago
    },
    {
      id: "local-2",
      user_id: userId,
      type: "analysis",
      title: "Local Sample: Follow-up conversation",
      score: 75,
      created_at: new Date(now.getTime() - 86400000).toISOString() // 1 day ago
    },
    {
      id: "local-3",
      user_id: userId,
      type: "analysis",
      title: "Local Sample: Product demo",
      score: 91,
      created_at: new Date(now.getTime() - 43200000).toISOString() // 12 hours ago
    }
  ];
  
  // Create sample performance data
  const performanceData = [
    {
      month: "Feb",
      objectionHandling: 65,
      activeListing: 70,
      valueProposition: 62,
      closingTechniques: 58,
      rapportBuilding: 67
    },
    {
      month: "Mar",
      objectionHandling: 72,
      activeListing: 78,
      valueProposition: 68,
      closingTechniques: 65,
      rapportBuilding: 75
    },
    {
      month: "Apr",
      objectionHandling: 81,
      activeListing: 84,
      valueProposition: 75,
      closingTechniques: 70,
      rapportBuilding: 82
    }
  ];

  // Create sample user stats
  const userStats = {
    totalConversations: 15,
    averageScore: 78,
    simulations: 8,
    practiceTime: { 
      hours: 6, 
      minutes: 30 
    },
    skillsAssessment: {
      objectionHandling: 76,
      activeListing: 82,
      valueProposition: 71,
      closingTechniques: 68,
      rapportBuilding: 79
    }
  };
  
  return { activities, performanceData, userStats };
}

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName: string) {
  const supabase = createClientComponentClient();
  console.log(`🔍 Checking if table ${tableName} exists...`);
  
  try {
    // Try two different ways to check table existence
    
    // Method 1: Try selecting from the table
    const { error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (!selectError) {
      console.log(`✅ Table ${tableName} exists (verified by SELECT)`);
      return true;
    }
    
    console.log(`💡 SELECT check result for ${tableName}:`, selectError);
    
    // Method 2: Try getting the table definition
    try {
      // This is a special query that returns the table definition if available
      const { data, error: infoError } = await supabase
        .rpc('pg_table_exists', { table_name: tableName })
        .single();
      
      if (!infoError && data) {
        console.log(`✅ Table ${tableName} exists (verified by RPC)`);
        return true;
      }
      
      console.log(`💡 RPC check result for ${tableName}:`, infoError || "No data returned");
      return false;
    } catch (rpcError) {
      console.log(`💡 RPC function not available:`, rpcError);
      
      // If RPC isn't available, just check if the select error indicates table doesn't exist
      if (selectError && 
          (selectError.code === '42P01' ||                            // Postgres error code for "relation does not exist"
           selectError.message?.includes('relation') && 
           selectError.message?.includes('does not exist'))) {
        console.log(`❌ Table ${tableName} doesn't exist (from error message)`);
        return false;
      }
      
      // If we can't determine from the error, assume the table doesn't exist
      console.log(`❓ Can't determine if table ${tableName} exists, assuming it doesn't`);
      return false;
    }
  } catch (error) {
    console.error(`💥 Unexpected error checking table ${tableName}:`, error);
    // In case of error, assume table doesn't exist to try creating it
    return false;
  }
}

/**
 * Ensure the user_stats table exists before trying to use it
 */
async function ensureUserStatsTable() {
  const supabase = createClientComponentClient();
  
  try {
    console.log("🔄 Checking if user_stats table exists...");
    
    // Use our more reliable check
    const exists = await tableExists('user_stats');
    
    if (!exists) {
      console.log("⚠️ Table user_stats doesn't exist, attempting to create it...");
      
      // Try multiple approaches to create the table
      
      // Approach 1: Use the user_stats table creation RPC if available
      try {
        const { error: rpcError } = await supabase.rpc('create_user_stats_table');
        if (!rpcError) {
          console.log("✅ Table created successfully via RPC");
          return { success: true };
        }
        
        console.log("⚠️ RPC error or not available:", rpcError);
      } catch (rpcErr) {
        console.log("⚠️ RPC failed:", rpcErr);
      }
      
      // Approach 2: Try execute_sql RPC
      try {
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS user_stats (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL REFERENCES auth.users(id),
              total_conversations INTEGER DEFAULT 0,
              average_score INTEGER DEFAULT 0,
              simulations INTEGER DEFAULT 0,
              practice_time_minutes INTEGER DEFAULT 0,
              objection_handling INTEGER DEFAULT 0,
              active_listening INTEGER DEFAULT 0,
              value_proposition INTEGER DEFAULT 0,
              closing_techniques INTEGER DEFAULT 0,
              rapport_building INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `
        });

        if (sqlError) {
          console.error("❌ SQL error:", sqlError);
        } else {
          console.log("✅ Table created successfully via SQL execute");
          return { success: true };
        }
      } catch (sqlErr) {
        console.error("❌ SQL execution not available:", sqlErr);
      }
      
      // If we got here, we couldn't create the table
      console.log("❌ Could not create table, will use local data");
      return { 
        success: false, 
        error: new Error("Could not create user_stats table"),
        message: "Using local data (table creation failed)"
      };
    }
    
    // Table exists
    console.log("✅ Table user_stats exists");
    return { success: true };
  } catch (error) {
    console.error("❌ Unexpected error in ensureUserStatsTable:", error);
    return { 
      success: false, 
      error, 
      message: "Using local data (unexpected error)"
    };
  }
}

/**
 * Function to populate stats when they're missing
 */
export async function ensureDashboardStats(userId: string) {
  const supabase = createClientComponentClient();

  try {
    console.log("🔄 Checking dashboard stats for user:", userId);
    
    // First, ensure the table exists
    const tableCheck = await ensureUserStatsTable();
    console.log("📊 Table check result:", tableCheck);
    
    if (!tableCheck.success) {
      console.log("❌ Table check failed, using local data");
      console.log("🔍 Error details:", tableCheck.error || "No error details");
      
      const { userStats } = getLocalFallbackData(userId);
      return {
        success: false,
        data: userStats,
        message: tableCheck.message || "Using local stats (table issue)"
      };
    }

    // Check if user has stats
    console.log("🔍 Looking for existing stats for user:", userId);
    const { data: existingStats, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is normal
      console.log("⚠️ Error fetching stats:", fetchError);
    }

    // If stats exist, return them
    if (existingStats) {
      console.log("✅ Found existing stats for user");
      return {
        success: true,
        data: existingStats,
        message: "Existing stats found"
      };
    } else {
      console.log("⚠️ No existing stats found for user");
    }

    // If no stats exist, create default stats from local data
    console.log("🔄 Creating default stats for user:", userId);
    const { userStats } = getLocalFallbackData(userId);
    
    // Try to insert into user_stats table
    try {
      console.log("📝 Inserting new stats record");
      
      // Log the data we're trying to insert
      console.log("📄 Insert data:", {
        user_id: userId,
        total_conversations: userStats.totalConversations,
        average_score: userStats.averageScore,
        // ... other fields omitted for brevity
      });
      
      const { data: insertedData, error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          total_conversations: userStats.totalConversations,
          average_score: userStats.averageScore,
          simulations: userStats.simulations,
          practice_time_minutes: userStats.practiceTime.hours * 60 + userStats.practiceTime.minutes,
          objection_handling: userStats.skillsAssessment.objectionHandling,
          active_listening: userStats.skillsAssessment.activeListing,
          value_proposition: userStats.skillsAssessment.valueProposition,
          closing_techniques: userStats.skillsAssessment.closingTechniques,
          rapport_building: userStats.skillsAssessment.rapportBuilding
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error inserting stats:", insertError);
        
        // Try again with a simpler insert without select
        console.log("🔄 Trying simpler insert without .select()");
        const { error: simpleInsertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            total_conversations: userStats.totalConversations,
            average_score: userStats.averageScore,
            // minimal fields to improve chance of success
          });
          
        if (simpleInsertError) {
          console.error("❌ Simple insert also failed:", simpleInsertError);
          return {
            success: false,
            data: userStats,
            message: `Using local stats (insert error: ${insertError.message || "Unknown error"})`
          };
        } else {
          console.log("✅ Simple insert succeeded");
          // If simple insert succeeded, still return the local data since we didn't get the inserted record
          return {
            success: true,
            data: userStats,
            message: "Created new stats in database (simple insert)"
          };
        }
      }

      console.log("✅ Successfully created stats");
      return {
        success: true,
        data: insertedData || userStats,
        message: "Created new stats in database"
      };
    } catch (e: any) {
      console.error("❌ Exception inserting stats:", e);
      return {
        success: false,
        data: userStats,
        message: `Using local stats (${e.message || "Unknown error"})`
      };
    }
  } catch (error: any) {
    console.error("❌ Error in ensureDashboardStats:", error);
    // Return local stats as fallback
    const { userStats } = getLocalFallbackData(userId);
    return {
      success: false,
      data: userStats,
      message: `Using fallback local stats (${error.message || "Unknown error"})`
    };
  }
}

/**
 * Format stats from database or local into the dashboard format
 */
export function formatDashboardStats(stats: any) {
  // Check if stats is from database or local
  if (stats.practice_time_minutes !== undefined) {
    // Database format
    return {
      totalConversations: stats.total_conversations || 0,
      averageScore: stats.average_score || 0,
      simulations: stats.simulations || 0,
      practiceTime: { 
        hours: Math.floor((stats.practice_time_minutes || 0) / 60), 
        minutes: (stats.practice_time_minutes || 0) % 60 
      },
      skillsAssessment: {
        objectionHandling: stats.objection_handling || 0,
        activeListing: stats.active_listening || 0,
        valueProposition: stats.value_proposition || 0,
        closingTechniques: stats.closing_techniques || 0,
        rapportBuilding: stats.rapport_building || 0
      }
    };
  } else {
    // Already in dashboard format
    return stats;
  }
}
