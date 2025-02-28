"use client"

import { useState } from "react"
import { BarChart3, Clock, Download, FileText, Mic, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { SentimentChart } from "@/components/sentiment-chart"
import { KeywordsChart } from "@/components/keywords-chart"

export function ConversationAnalysis() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const handleFileUpload = () => {
    setUploadedFiles([...uploadedFiles, "Sales Call - Acme Corp (Feb 23).mp3"])
  }

  const removeFile = (file: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== file))
  }

  const startAnalysis = () => {
    if (uploadedFiles.length === 0) return
    
    setAnalyzing(true)
    
    // Simulate analysis completion after 3 seconds
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysisComplete(true)
      setActiveTab("results")
    }, 3000)
  }

  const resetAnalysis = () => {
    setUploadedFiles([])
    setAnalysisComplete(false)
    setActiveTab("upload")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversation Analysis</h1>
          <p className="text-muted-foreground">Upload and analyze your sales conversations for detailed feedback</p>
        </div>
        <div className="flex items-center gap-2">
          {analysisComplete && (
            <>
              <Button variant="outline" onClick={resetAnalysis}>
                New Analysis
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload" disabled={analyzing}>Upload</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisComplete}>Results</TabsTrigger>
          <TabsTrigger value="history" disabled={analyzing}>History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Conversation</CardTitle>
              <CardDescription>Upload audio or text files of your sales conversations for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleFileUpload}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Drag and drop files or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Supports MP3, WAV, MP4, TXT, PDF, and DOCX</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Uploaded Files</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                          <Mic className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file}</p>
                          <p className="text-xs text-muted-foreground">2.4 MB • Audio</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(file)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <Button className="w-full" onClick={startAnalysis} disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" fill="none" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    "Start Analysis"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% from your average</p>
                <Progress value={78} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Talk Ratio</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">62:38</div>
                <p className="text-xs text-muted-foreground">Customer:Sales Rep</p>
                <div className="mt-2 flex w-full gap-1">
                  <div className="h-2 w-[62%] rounded-l-full bg-primary"></div>
                  <div className="h-2 w-[38%] rounded-r-full bg-primary/30"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24m 18s</div>
                <p className="text-xs text-muted-foreground">-2m from your average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Emotional tone throughout the conversation</CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key Topics</CardTitle>
                <CardDescription>Most discussed topics during the conversation</CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordsChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
              <CardDescription>AI-generated insights and improvement suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">Strength</Badge>
                  <h3 className="text-sm font-medium">Excellent Discovery Questions</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your open-ended questions at 3:45 and 12:20 effectively uncovered the customer's pain points. Continue using this technique to gather valuable information.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700">Improvement</Badge>
                  <h3 className="text-sm font-medium">Value Proposition Clarity</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  At 8:15, your value proposition could be more concise and focused on the specific benefits relevant to the customer's expressed needs.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700">Area of Concern</Badge>
                  <h3 className="text-sm font-medium">Objection Handling</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  At 15:30, when the customer raised concerns about pricing, consider acknowledging their concern before explaining the value. Try: "I understand your budget constraints. Let me explain how our solution provides ROI that justifies the investment."
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">Strength</Badge>
                  <h3 className="text-sm font-medium">Active Listening</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Throughout the call, you effectively summarized the customer's points, showing you were listening attentively. This built rapport and trust.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation Transcript</CardTitle>
              <CardDescription>Full transcript with highlighted insights</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>You</Badge>
                  <span className="text-xs text-muted-foreground">0:00</span>
                </div>
                <p className="text-sm">
                  Hi Sarah, thanks for taking the time to speak with me today. I'm excited to learn more about your company's needs and see how we might be able to help.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Customer</Badge>
                  <span className="text-xs text-muted-foreground">0:15</span>
                </div>
                <p className="text-sm">
                  Thanks for reaching out. I've been looking at several solutions, so I'm interested to hear what makes yours different.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>You</Badge>
                  <span className="text-xs text-muted-foreground">0:30</span>
                </div>
                <p className="text-sm">
                  I appreciate your directness. Before I dive into our solution, I'd love to understand more about your current challenges. <span className="bg-green-100 px-1 rounded">What specific problems are you trying to solve with a new solution?</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Customer</Badge>
                  <span className="text-xs text-muted-foreground">0:45</span>
                </div>
                <p className="text-sm">
                  Well, we're struggling with efficiency in our sales process. Our team is spending too much time on administrative tasks instead of selling, and we don't have good visibility into our pipeline.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>You</Badge>
                  <span className="text-xs text-muted-foreground">1:10</span>
                </div>
                <p className="text-sm">
                  I see. So you're looking to streamline your sales process and get better pipeline visibility. <span className="bg-green-100 px-1 rounded">How is this affecting your team's performance and your business goals?</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Customer</Badge>
                  <span className="text-xs text-muted-foreground">1:25</span>
                </div>
                <p className="text-sm">
                  It's definitely impacting our numbers. We're missing our targets by about 15% each quarter, and I think a lot of it comes down to these inefficiencies.
                </p>
              </div>
              
              {/* Additional transcript entries would continue here */}
              <div className="text-center text-sm text-muted-foreground">
                Transcript continues for full 24-minute conversation...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Your previous conversation analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Discovery Call - TechStart Inc.</p>
                        <p className="text-xs text-muted-foreground">Feb {20 - item}, 2023 • 18 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{70 + item}%</Badge>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

