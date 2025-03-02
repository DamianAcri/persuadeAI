// lib/userDataService.ts

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Interfaces
export interface ActivityData {
  id: string;
  user_id: string;
  type: string;
  title: string;
  score: number;
  created_at: string;
  icon?: any; // Added by the component
  time?: string; // Added by the component
}

export interface PerformanceData {
  month: string;
  objectionHandling: number;
  activeListing: number;
  valueProposition: number;
  closingTechniques: number;
  rapportBuilding?: number;
}

export interface DashboardStats {
  totalConversations: number;
  averageScore: number;
  simulations: number;
  practiceTime: { hours: number; minutes: number };
  skillsAssessment: {
    objectionHandling: number;
    activeListing: number;
    valueProposition: number;
    closingTechniques: number;
    rapportBuilding: number;
  };
}

// Format relative time for display
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Function to get user's recent activities from analysis_results
export async function getUserRecentActivities(
  userId: string,
  limit: number = 5
): Promise<ActivityData[]> {
  console.log(`🔍 Getting activities for user: ${userId}, limit: ${limit}`);
  
  try {
    const supabase = createClientComponentClient();
    
    // Query directly from analysis_results table 
    const { data: analysisData, error } = await supabase
      .from('analysis_results')
      .select('id, user_id, created_at, score, overall')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error(`❌ Error getting activities: ${error.message}`);
      return [];
    }
    
    if (!analysisData || analysisData.length === 0) {
      console.log(`⚠️ No analysis results found for user ${userId}`);
      return [];
    }
    
    console.log(`✅ Found ${analysisData.length} analysis results`);
    
    // Transform analysis results to activity format
    return analysisData.map(item => ({
      id: item.id || `local-${Math.random().toString(36).substring(2,9)}`,
      user_id: item.user_id,
      type: 'analysis',
      title: item.overall 
        ? `Analysis: ${item.overall.substring(0, 30)}...` 
        : "Conversation Analysis",
      score: Math.round((item.score || 5) * 10), // Convert from 0-10 to percentage
      created_at: item.created_at || new Date().toISOString()
    }));
    
  } catch (error: any) {
    console.error(`💥 Error in getUserRecentActivities: ${error.message}`);
    return [];
  }
}

// Function to get performance data from analysis_results
export async function getUserPerformanceData(userId: string): Promise<PerformanceData[]> {
  console.log(`🔍 Getting performance data for user: ${userId}`);
  
  try {
    const supabase = createClientComponentClient();
    
    // Get all user's analysis results
    const { data: analysisData, error } = await supabase
      .from('analysis_results')
      .select('created_at, objection_handling, active_listening, value_proposition, closing_techniques')
      .eq('user_id', userId);
      
    if (error) {
      console.error(`❌ Error getting performance data: ${error.message}`);
      return [];
    }
    
    if (!analysisData || analysisData.length === 0) {
      console.log(`⚠️ No analysis data found for user ${userId}`);
      return [];
    }
    
    console.log(`✅ Found ${analysisData.length} analysis records`);
    
    // Aggregate analysis data by month
    const monthlyData: Record<string, any> = {};
    
    // Process each analysis result
    analysisData.forEach(item => {
      if (!item.created_at) return;
      
      const date = new Date(item.created_at);
      const monthKey = date.toLocaleString('en-us', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          count: 0,
          objectionHandling: 0,
          activeListing: 0,
          valueProposition: 0,
          closingTechniques: 0
        };
      }
      
      const data = monthlyData[monthKey];
      data.count++;
      
      // Some scores might be null, so use nullish coalescing
      if (item.objection_handling != null) data.objectionHandling += item.objection_handling * 10;
      if (item.active_listening != null) data.activeListing += item.active_listening * 10;
      if (item.value_proposition != null) data.valueProposition += item.value_proposition * 10;
      if (item.closing_techniques != null) data.closingTechniques += item.closing_techniques * 10;
    });
    
    // Define month order for sorting
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Calculate averages and format data
    const formattedData: PerformanceData[] = Object.keys(monthlyData)
      .map(month => {
        const data = monthlyData[month];
        return {
          month,
          objectionHandling: Math.round(data.objectionHandling / data.count) || 0,
          activeListing: Math.round(data.activeListing / data.count) || 0,
          valueProposition: Math.round(data.valueProposition / data.count) || 0,
          closingTechniques: Math.round(data.closingTechniques / data.count) || 0,
          rapportBuilding: Math.round((data.objectionHandling + data.activeListing) / (2 * data.count)) || 0
        };
      })
      // Sort by month order
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    
    return formattedData;
  } catch (error: any) {
    console.error(`💥 Error in getUserPerformanceData: ${error.message}`);
    return [];
  }
}

// Calculate dashboard stats using only analysis_results data
export async function getUserDashboardStats(userId: string): Promise<DashboardStats> {
  console.log(`🔍 Getting dashboard stats for user: ${userId}`);
  
  try {
    const supabase = createClientComponentClient();
    
    // Get all user's analysis results
    const { data: analysisData, error } = await supabase
      .from('analysis_results')
      .select('created_at, score, objection_handling, active_listening, value_proposition, closing_techniques')
      .eq('user_id', userId);
      
    if (error) {
      console.error(`❌ Error getting analysis data: ${error.message}`);
      return getDefaultDashboardStats();
    }
    
    if (!analysisData || analysisData.length === 0) {
      console.log(`⚠️ No analysis data found for user ${userId}`);
      return getDefaultDashboardStats();
    }
    
    console.log(`✅ Found ${analysisData.length} analysis records for stats calculation`);
    
    // Calculate stats from analysis data
    const totalConversations = analysisData.length;
    
    // Calculate average score
    const totalScore = analysisData.reduce((sum, item) => sum + (item.score || 0), 0);
    const averageScore = Math.round((totalScore / totalConversations) * 10); // Convert to percentage
    
    // Calculate practice time (assume 15 minutes per analysis)
    const totalMinutes = totalConversations * 15;
    const practiceHours = Math.floor(totalMinutes / 60);
    const practiceMinutes = totalMinutes % 60;
    
    // Calculate skill averages
    const skills = {
      objectionHandling: 0,
      activeListing: 0, 
      valueProposition: 0,
      closingTechniques: 0
    };
    
    let validCounts = {
      objectionHandling: 0,
      activeListing: 0,
      valueProposition: 0,
      closingTechniques: 0
    };
    
    analysisData.forEach(item => {
      // Sum up non-null values
      if (item.objection_handling != null) {
        skills.objectionHandling += item.objection_handling * 10;
        validCounts.objectionHandling++;
      }
      
      if (item.active_listening != null) {
        skills.activeListing += item.active_listening * 10;
        validCounts.activeListing++;
      }
      
      if (item.value_proposition != null) {
        skills.valueProposition += item.value_proposition * 10;
        validCounts.valueProposition++;
      }
      
      if (item.closing_techniques != null) {
        skills.closingTechniques += item.closing_techniques * 10;
        validCounts.closingTechniques++;
      }
    });
    
    // Calculate averages, avoiding division by zero
    const skillsAssessment = {
      objectionHandling: validCounts.objectionHandling > 0 
        ? Math.round(skills.objectionHandling / validCounts.objectionHandling) 
        : 0,
      activeListing: validCounts.activeListing > 0 
        ? Math.round(skills.activeListing / validCounts.activeListing) 
        : 0,
      valueProposition: validCounts.valueProposition > 0 
        ? Math.round(skills.valueProposition / validCounts.valueProposition) 
        : 0,
      closingTechniques: validCounts.closingTechniques > 0 
        ? Math.round(skills.closingTechniques / validCounts.closingTechniques) 
        : 0,
      rapportBuilding: (validCounts.objectionHandling + validCounts.activeListing) > 0
        ? Math.round((skills.objectionHandling + skills.activeListing) / 
            (validCounts.objectionHandling + validCounts.activeListing))
        : 0
    };
    
    return {
      totalConversations,
      averageScore,
      simulations: Math.floor(totalConversations / 2), // Estimate
      practiceTime: {
        hours: practiceHours,
        minutes: practiceMinutes
      },
      skillsAssessment
    };
    
  } catch (error: any) {
    console.error(`💥 Error in getUserDashboardStats: ${error.message}`);
    return getDefaultDashboardStats();
  }
}

// Get default dashboard stats when no data is available
function getDefaultDashboardStats(): DashboardStats {
  return {
    totalConversations: 0,
    averageScore: 0,
    simulations: 0,
    practiceTime: {
      hours: 0,
      minutes: 0
    },
    skillsAssessment: {
      objectionHandling: 0,
      activeListing: 0,
      valueProposition: 0,
      closingTechniques: 0,
      rapportBuilding: 0
    }
  };
}

// Function to get demo data for display when user is not logged in
export function getDemoData() {
  const demoActivities: ActivityData[] = [
    {
      id: "demo-1",
      user_id: "demo",
      type: "analysis",
      title: "Demo: Sales pitch for enterprise client",
      score: 78,
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: "demo-2",
      user_id: "demo",
      type: "analysis",
      title: "Demo: Product demonstration call",
      score: 85,
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: "demo-3",
      user_id: "demo",
      type: "analysis",
      title: "Demo: Follow-up conversation",
      score: 92,
      created_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
    }
  ];
  
  const demoPerformanceData: PerformanceData[] = [
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
  
  const demoStats: DashboardStats = {
    totalConversations: 12,
    averageScore: 82,
    simulations: 5,
    practiceTime: {
      hours: 3,
      minutes: 45
    },
    skillsAssessment: {
      objectionHandling: 74,
      activeListing: 82,
      valueProposition: 68,
      closingTechniques: 65,
      rapportBuilding: 78
    }
  };
  
  return {
    activities: demoActivities,
    performanceData: demoPerformanceData,
    stats: demoStats
  };
}

/**
 * Function to check if database tables exist
 */
export async function checkDatabaseTables(): Promise<{exists: Record<string, boolean>, error?: string}> {
  try {
    const supabase = createClientComponentClient();
    
    // Only check for the analysis_results table that we know exists
    const tables = ['analysis_results', 'profiles'];
    
    const results: Record<string, boolean> = {};
    
    // Check each table
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact', head: true });
          
        results[table] = !error;
        
        console.log(`Table ${table} check:`, !error ? 'Exists' : `Error: ${error?.message}`);
      } catch (e: any) {
        console.error(`Error checking ${table}:`, e.message);
        results[table] = false;
      }
    }
    
    return { exists: results };
  } catch (error: any) {
    console.error("Error in checkDatabaseTables:", error);
    return { 
      exists: {}, 
      error: `Failed to check tables: ${error.message}`
    };
  }
}

/**
 * Function to seed initial sample data for testing
 */
export async function seedUserData(userId: string): Promise<{success: boolean, message: string}> {
  try {
    const supabase = createClientComponentClient();
    
    console.log(`Starting data seeding for user ${userId}`);
    
    // Check if user already has data
    const { count, error: countError } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (countError) {
      console.error("Error checking existing data:", countError);
      return { 
        success: false, 
        message: `Error checking existing data: ${countError.message}` 
      };
    }
    
    // If user already has data, don't seed
    if (count && count > 0) {
      console.log(`User ${userId} already has ${count} analysis results`);
      return { success: false, message: 'User already has analysis data' };
    }
    
    // Current date for timestamps
    const now = new Date();
    
    // Sample analysis results data - timestamps distributed over last 2 months
    const sampleData = [
      {
        user_id: userId,
        conversation: "Sample sales call transcript with customer A",
        overall: "Good handling of objections but could improve closing techniques",
        score: 7.5,
        objection_handling: 8.2,
        active_listening: 7.0,
        value_proposition: 6.8,
        closing_techniques: 5.5,
        created_at: new Date(now.getTime() - 3600000 * 24 * 50).toISOString() // 50 days ago (last month)
      },
      {
        user_id: userId,
        conversation: "Sample sales call transcript with customer B",
        overall: "Excellent rapport building and active listening skills",
        score: 8.2,
        objection_handling: 7.8,
        active_listening: 9.0,
        value_proposition: 7.9,
        closing_techniques: 6.8,
        created_at: new Date(now.getTime() - 3600000 * 24 * 40).toISOString() // 40 days ago (last month)
      },
      {
        user_id: userId,
        conversation: "Sample sales call transcript with customer C",
        overall: "Great improvement in value proposition presentation",
        score: 8.5,
        objection_handling: 8.0,
        active_listening: 8.5,
        value_proposition: 9.0,
        closing_techniques: 7.4,
        created_at: new Date(now.getTime() - 3600000 * 24 * 30).toISOString() // 30 days ago (last month)
      },
      {
        user_id: userId,
        conversation: "Sample sales call transcript with customer D",
        overall: "Strong closing technique but needs work on objection handling",
        score: 7.9,
        objection_handling: 6.5,
        active_listening: 8.0,
        value_proposition: 7.6,
        closing_techniques: 8.8,
        created_at: new Date(now.getTime() - 3600000 * 24 * 20).toISOString() // 20 days ago
      },
      {
        user_id: userId,
        conversation: "Sample sales call transcript with customer E",
        overall: "Well-balanced approach with good value proposition",
        score: 8.4,
        objection_handling: 8.3,
        active_listening: 8.7,
        value_proposition: 8.9,
        closing_techniques: 7.8,
        created_at: new Date(now.getTime() - 3600000 * 24 * 10).toISOString() // 10 days ago
      },
      {
        user_id: userId,
        conversation: "Sample sales call transcript with customer F",
        overall: "Very strong active listening but needs work on closing",
        score: 8.6,
        objection_handling: 8.5,
        active_listening: 9.2,
        value_proposition: 8.7,
        closing_techniques: 7.2,
        created_at: new Date(now.getTime() - 3600000 * 24 * 5).toISOString() // 5 days ago
      },
      {
        user_id: userId,
        conversation: "Most recent sample sales conversation",
        overall: "Excellent overall performance with balanced skills",
        score: 9.2,
        objection_handling: 9.0,
        active_listening: 9.5,
        value_proposition: 9.2,
        closing_techniques: 8.8,
        created_at: new Date(now.getTime() - 3600000 * 12).toISOString() // 12 hours ago
      }
    ];
    
    console.log(`Preparing to insert ${sampleData.length} sample records`);
    
    // Stringify any nested JSON fields and prepare data for insert
    const dataToInsert = sampleData.map(item => ({
      ...item,
      strengths: JSON.stringify(["Good pace", "Clear explanations", "Effective questions"]),
      weaknesses: JSON.stringify(["Could improve closing", "Sometimes interrupted client"]),
      tips: JSON.stringify(["Practice open-ended questions", "Work on summarizing client needs"])
    }));
    
    // Insert sample data
    const { error: insertError } = await supabase
      .from('analysis_results')
      .insert(dataToInsert);
      
    if (insertError) {
      console.error("Error inserting sample data:", insertError);
      return { 
        success: false, 
        message: `Failed to seed data: ${insertError.message}` 
      };
    }
    
    console.log(`Successfully seeded ${dataToInsert.length} records for user ${userId}`);
    return { success: true, message: `Sample analysis data seeded successfully (${dataToInsert.length} records)` };
    
  } catch (error: any) {
    console.error("Error in seedUserData:", error);
    return { 
      success: false, 
      message: `Error seeding data: ${error.message}` 
    };
  }
}
