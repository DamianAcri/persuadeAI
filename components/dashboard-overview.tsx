"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Clock,
  MessageSquare,
  Mic,
  ScrollText,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RecentActivity } from "@/components/recent-activity";
import { PerformanceChart } from "@/components/performance-chart";
import { FileUploadHandler } from "@/app/ai/analysis/components/FileUploadHandler";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Define interfaces for our data types
interface DashboardStats {
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

export function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalConversations: 0,
    averageScore: 0,
    simulations: 0,
    practiceTime: { hours: 0, minutes: 0 },
    skillsAssessment: {
      objectionHandling: 0,
      activeListing: 0,
      valueProposition: 0,
      closingTechniques: 0,
      rapportBuilding: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("Loading...");
  const supabase = createClientComponentClient();

  // Load user data and statistics
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check for active session
        const { data } = await supabase.auth.getSession();
        console.log("🔍 Session:", data.session ? "Active" : "Inactive");
        
        if (!data.session || !data.session.user) {
          console.log("⚠️ No session, using demo data");
          // Use demo data for non-authenticated user
          setDashboardStats(getDemoData());
          setUserName("Demo User");
          setDataSource("Demo data (no session)");
          setIsLoading(false);
          return;
        }
        
        const userId = data.session.user.id;
        console.log("👤 User:", userId);
        
        // Get user name from email or profile
        setUserName(data.session.user.email?.split('@')[0] || "User");
        
        try {
          // Try to load data directly from analysis_results table
          const stats = await getStatsFromAnalysisResults(userId);
          setDashboardStats(stats);
          setDataSource("From analysis_results");
        } catch (statsError) {
          console.error("❌ Error getting stats:", statsError);
          // Use demo data on error
          setDashboardStats(getDemoData());
          setDataSource("Demo data (after error)");
        }
      } catch (error) {
        console.error("❌ General error:", error);
        
        // Use demo data if there's an error
        setDashboardStats(getDemoData());
        setDataSource("Demo data (after error)");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [supabase]);

  // Function to get stats directly from analysis_results table
  async function getStatsFromAnalysisResults(userId: string): Promise<DashboardStats> {
    // Query analysis_results table for conversation analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_results')
      .select('created_at, score, objection_handling, active_listening, value_proposition, closing_techniques')
      .eq('user_id', userId);
      
    // Query pitch_summary table for script analysis data
    const { data: scriptData, error: scriptError } = await supabase
      .from('pitch_summary')
      .select('created_at, score')
      .eq('user_id', userId);
    
    if ((analysisError && !analysisData) && (scriptError && !scriptData)) {
      console.error(`❌ Error getting analysis data: ${analysisError?.message || scriptError?.message}`);
      throw new Error("No data found");
    }
    
    // Combine data from both sources
    const analysisCount = analysisData?.length || 0;
    const scriptCount = scriptData?.length || 0;
    const totalConversations = analysisCount + scriptCount;
    
    if (totalConversations === 0) {
      console.log(`⚠️ No analysis data found for user ${userId}`);
      throw new Error("No data found");
    }
    
    console.log(`✅ Found ${analysisCount} conversation analysis records and ${scriptCount} script analysis records`);
    
    // Calculate average score across both types
    const totalAnalysisScore = analysisData?.reduce((sum, item) => sum + (item.score || 0), 0) || 0;
    const totalScriptScore = scriptData?.reduce((sum, item) => sum + (item.score || 0), 0) || 0;
    const averageScore = Math.round(((totalAnalysisScore + totalScriptScore) / totalConversations) * 10); // Convert to percentage
    
    // Calculate practice time (assume 15 minutes per analysis, 10 minutes per script)
    const totalMinutes = (analysisCount * 15) + (scriptCount * 10);
    const practiceHours = Math.floor(totalMinutes / 60);
    const practiceMinutes = totalMinutes % 60;
    
    // Calculate skill averages (only from conversation analysis as scripts don't have these fields)
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
    
    analysisData?.forEach(item => {
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
      simulations: Math.floor(analysisCount / 2), // Estimate
      practiceTime: {
        hours: practiceHours,
        minutes: practiceMinutes
      },
      skillsAssessment
    };
  }

  // Get demo data for when there's no real data
  function getDemoData(): DashboardStats {
    return {
      totalConversations: 13,
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
  }

  // Handler for file upload
  function handleFileExtracted(extractedText: string) {
    if (extractedText) {
      const encodedText = encodeURIComponent(extractedText);
      router.push(`/ai/analysis?extracted=${encodedText}&method=upload`);
    } else {
      setFileError("No text could be extracted from the file. Please try another file.");
    }
  }

  function handleFileProcessingState(isProcessing: boolean) {
    setIsFileProcessing(isProcessing);
    if (isProcessing) {
      setFileError(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userName}. Here's an overview of your sales performance.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <p className="text-xs text-gray-400 mt-1">Data source: {dataSource}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export Data</Button>
          <Button>New Simulation</Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats cards section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversations
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 
                    <span className="animate-pulse">...</span> : 
                    dashboardStats.totalConversations
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : "From all time"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 
                    <span className="animate-pulse">...</span> : 
                    `${dashboardStats.averageScore}%`
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : "Across all activities"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Simulations
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 
                    <span className="animate-pulse">...</span> : 
                    dashboardStats.simulations
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : "Completed exercises"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Practice Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 
                    <span className="animate-pulse">...</span> : 
                    `${dashboardStats.practiceTime.hours}h ${dashboardStats.practiceTime.minutes}m`
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : "Total training time"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Your sales performance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <PerformanceChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest conversations and simulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>

          {/* Feature cards section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Analysis</CardTitle>
                <CardDescription>
                  Upload and analyze your sales conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadHandler 
                  onTextExtracted={handleFileExtracted} 
                  onProcessingStateChange={handleFileProcessingState}
                />
                {isFileProcessing && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing file...
                  </div>
                )}
                {fileError && (
                  <div className="mt-2 text-sm text-red-600">
                    {fileError}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link
                  href="/ai/analysis"
                  className="flex items-center text-sm text-primary"
                >
                  Go to Analysis
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Real-time Assistance</CardTitle>
                <CardDescription>
                  Get live feedback during your sales calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-24 flex-col items-center justify-center gap-2">
                  <Mic className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Start recording for real-time feedback
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href="/real-time"
                  className="flex items-center text-sm text-primary"
                >
                  Go to Real-time Assistance
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales Script Evaluation</CardTitle>
                <CardDescription>
                  Improve your sales scripts with AI feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed">
                  <ScrollText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href="/ai/script-analysis"
                  className="flex items-center text-sm text-primary"
                >
                  Go to Script Evaluation
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Performance tab content */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>
                Your performance across key sales skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Objection Handling
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? 
                      <span className="animate-pulse">...</span> : 
                      `${dashboardStats.skillsAssessment.objectionHandling}%`
                    }
                  </span>
                </div>
                <Progress value={dashboardStats.skillsAssessment.objectionHandling} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Listening</span>
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? 
                      <span className="animate-pulse">...</span> : 
                      `${dashboardStats.skillsAssessment.activeListing}%`
                    }
                  </span>
                </div>
                <Progress value={dashboardStats.skillsAssessment.activeListing} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Value Proposition</span>
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? 
                      <span className="animate-pulse">...</span> : 
                      `${dashboardStats.skillsAssessment.valueProposition}%`
                    }
                  </span>
                </div>
                <Progress value={dashboardStats.skillsAssessment.valueProposition} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Closing Techniques
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? 
                      <span className="animate-pulse">...</span> : 
                      `${dashboardStats.skillsAssessment.closingTechniques}%`
                    }
                  </span>
                </div>
                <Progress value={dashboardStats.skillsAssessment.closingTechniques} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rapport Building</span>
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? 
                      <span className="animate-pulse">...</span> : 
                      `${dashboardStats.skillsAssessment.rapportBuilding}%`
                    }
                  </span>
                </div>
                <Progress value={dashboardStats.skillsAssessment.rapportBuilding} />
              </div>

              {/* Comparative chart */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4">Skills Evolution</h3>
                <div className="h-60">
                  <PerformanceChart />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance insights card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                AI recommendations based on your skills profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-100">
                  <h4 className="font-medium text-amber-800">Focus Area: {getLowestSkill(dashboardStats.skillsAssessment)}</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Our AI analysis suggests focusing on improving your {getLowestSkill(dashboardStats.skillsAssessment).toLowerCase()} 
                    skills as it's currently your lowest-performing area. Consider practicing techniques through targeted simulations.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-100">
                  <h4 className="font-medium text-green-800">Strength: {getHighestSkill(dashboardStats.skillsAssessment)}</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Your {getHighestSkill(dashboardStats.skillsAssessment).toLowerCase()} abilities are your strongest asset. 
                    Continue leveraging this skill while working on other areas.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                  <h4 className="font-medium text-blue-800">Recommended Action</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Try our simulation module focused on {getLowestSkill(dashboardStats.skillsAssessment)} to improve your performance
                    in this area. We recommend at least 2-3 practice sessions this week.
                  </p>
                  <div className="mt-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Start Simulation</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity tab content */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest conversations and simulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity extended />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get the lowest performing skill
function getLowestSkill(skills: { 
  objectionHandling: number;
  activeListing: number;
  valueProposition: number;
  closingTechniques: number;
  rapportBuilding: number;
}) {
  const skillMap = {
    "Objection Handling": skills.objectionHandling,
    "Active Listening": skills.activeListing,
    "Value Proposition": skills.valueProposition,
    "Closing Techniques": skills.closingTechniques,
    "Rapport Building": skills.rapportBuilding
  };

  let lowestSkill = "Closing Techniques";
  let lowestValue = 100;

  for (const [skill, value] of Object.entries(skillMap)) {
    if (value < lowestValue) {
      lowestValue = value;
      lowestSkill = skill;
    }
  }

  return lowestSkill;
}

// Helper function to get the highest performing skill
function getHighestSkill(skills: { 
  objectionHandling: number;
  activeListing: number;
  valueProposition: number;
  closingTechniques: number;
  rapportBuilding: number;
}) {
  const skillMap = {
    "Objection Handling": skills.objectionHandling,
    "Active Listening": skills.activeListing,
    "Value Proposition": skills.valueProposition,
    "Closing Techniques": skills.closingTechniques,
    "Rapport Building": skills.rapportBuilding
  };

  let highestSkill = "Active Listening";
  let highestValue = 0;

  for (const [skill, value] of Object.entries(skillMap)) {
    if (value > highestValue) {
      highestValue = value;
      highestSkill = skill;
    }
  }

  return highestSkill;
}