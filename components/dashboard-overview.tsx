"use client";

import { useState } from "react";
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

export function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFileExtracted(extractedText: string) {
    if (extractedText) {
      // Only redirect if there's actually text extracted
      const encodedText = encodeURIComponent(extractedText);
      router.push(`/ai/analysis?extracted=${encodedText}&method=upload`);
    } else {
      setFileError("No text could be extracted from the file. Please try another file.");
    }
  }

  // Add loading state handler for better UX
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
            Welcome back, Alex. Here's an overview of your sales performance.
          </p>
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
          {/* Stats cards section - unchanged */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversations
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
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
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
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
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
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
                <div className="text-2xl font-bold">18h 24m</div>
                <p className="text-xs text-muted-foreground">
                  +3h from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts section - unchanged */}
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

          {/* Feature cards section - with improved file upload card */}
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
                  href="/scripts"
                  className="flex items-center text-sm text-primary"
                >
                  Go to Script Evaluation
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Performance tab content - unchanged */}
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
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <Progress value={78} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Listening</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Value Proposition</span>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Closing Techniques
                  </span>
                  <span className="text-sm text-muted-foreground">81%</span>
                </div>
                <Progress value={81} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rapport Building</span>
                  <span className="text-sm text-muted-foreground">88%</span>
                </div>
                <Progress value={88} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity tab content - unchanged */}
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