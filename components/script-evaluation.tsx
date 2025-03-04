"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CheckCircle2, ChevronUp, Copy, Download, Edit, FileText, Plus, Save, Trash, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ScriptEvaluation() {
  const [activeTab, setActiveTab] = useState("editor")
  const [scriptName, setScriptName] = useState("Product Demo Script")
  const [scriptContent, setScriptContent] = useState(
    "Hello [Customer Name],\n\nThank you for taking the time to join this demo today. I'm excited to show you how our product can help solve the challenges you mentioned in our previous conversation.\n\nBefore we dive in, I'd like to quickly confirm the key pain points you mentioned: you're struggling with [Pain Point 1] and [Pain Point 2]. Is that correct? Are there any other challenges you'd like to address today?\n\nGreat. Today I'll be showing you how our solution addresses these specific challenges. Feel free to interrupt me with questions at any point.\n\nLet me start by giving you a quick overview of our platform...",
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Get user ID on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUserId(data.session.user.id)
      }
    }
    
    getUser()
  }, [supabase])

  const handleAnalyzeScript = async () => {
    // Ensure user is authenticated
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      alert("You must be logged in to analyze scripts")
      return
    }
    
    setIsAnalyzing(true)

    try {
      // Make API call to analyze script
      const response = await fetch("/api/ai/script-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: scriptContent,
          targetAudience: "Sales Prospects",
          productType: "SaaS"
        }),
      })
      
      if (!response.ok) {
        throw new Error("Script analysis failed")
      }
      
      const result = await response.json()
      
      // Save analysis result to database
      const { error } = await supabase
        .from('pitch_summary')
        .insert([
          {
            user_id: data.session.user.id,
            summary: result.overall_quality,
            score: result.persuasiveness_score, 
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            recommendations: result.suggestions,
            conversation: scriptContent,
            created_at: new Date().toISOString()
          }
        ])
      
      if (error) {
        console.error("Failed to save analysis:", error)
      }
      
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setActiveTab("feedback")
    } catch (error) {
      console.error("Script analysis error:", error)
      setIsAnalyzing(false)
      alert("Failed to analyze script. Please try again.")
    }
  }

  const handleSaveScript = () => {
    setIsEditing(false)
    // Save logic would go here
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Script Evaluation</h1>
          <p className="text-muted-foreground">Improve your sales scripts with AI-powered feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Script
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {analysisComplete && (
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Script Editor</TabsTrigger>
          <TabsTrigger value="feedback" disabled={!analysisComplete}>
            Feedback
          </TabsTrigger>
          <TabsTrigger value="library">Script Library</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>
                  {isEditing ? (
                    <Input value={scriptName} onChange={(e) => setScriptName(e.target.value)} className="max-w-md" />
                  ) : (
                    scriptName
                  )}
                </CardTitle>
                <CardDescription>Edit your sales script and get AI-powered feedback</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveScript}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Name
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select defaultValue="product-demo">
                      <SelectTrigger>
                        <SelectValue placeholder="Select script type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product-demo">Product Demo</SelectItem>
                        <SelectItem value="discovery">Discovery Call</SelectItem>
                        <SelectItem value="follow-up">Follow-up Call</SelectItem>
                        <SelectItem value="closing">Closing Script</SelectItem>
                        <SelectItem value="objection">Objection Handling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>

                <Textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {scriptContent.length} characters • {scriptContent.split(/\s+/).length} words
              </p>
              <Button onClick={handleAnalyzeScript} disabled={isAnalyzing || scriptContent.length < 10}>
                {isAnalyzing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  "Analyze Script"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">Good quality script with room for improvement</p>
                <Progress value={82} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Strengths</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Clear Structure</Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Customer-Focused</Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Engaging Questions</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Areas to Improve</CardTitle>
                <ChevronUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Value Proposition</Badge>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Personalization</Badge>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Call to Action</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
              <CardDescription>AI-generated insights and improvement suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 p-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Strong Opening</p>
                    <p className="text-sm text-muted-foreground">
                      Your opening effectively thanks the customer and sets a positive tone for the demo. This helps
                      establish rapport from the start.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 p-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Pain Point Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      Excellent job confirming the customer's pain points before diving into the demo. This ensures
                      you're addressing their specific needs and shows you were listening in previous conversations.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-1">
                    <ChevronUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Value Proposition</p>
                    <p className="text-sm text-muted-foreground">
                      The script lacks a clear, concise value proposition. Consider adding a statement that clearly
                      articulates how your solution uniquely solves their problems and delivers value.
                    </p>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">Suggested improvement:</p>
                      <p className="text-muted-foreground">
                        "Our platform has helped companies like yours reduce [pain point 1] by 40% and improve [key
                        metric] by 25% within the first three months of implementation."
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-1">
                    <ChevronUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Personalization</p>
                    <p className="text-sm text-muted-foreground">
                      While you include placeholders for personalization, consider adding more industry-specific
                      language and examples relevant to the customer's business to make the script feel more tailored.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-1">
                    <ChevronUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Call to Action</p>
                    <p className="text-sm text-muted-foreground">
                      The script ends abruptly without a clear next step. Add a specific call to action that guides the
                      customer toward the next stage in your sales process.
                    </p>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">Suggested improvement:</p>
                      <p className="text-muted-foreground">
                        "Based on what we've discussed today, I'd recommend scheduling a follow-up call with our
                        implementation specialist to discuss how we can tailor the solution to your specific workflow.
                        Would next Tuesday at 2 PM work for your team?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enhanced Script</CardTitle>
              <CardDescription>AI-improved version of your script</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4 font-mono text-sm whitespace-pre-line">
                <p>Hello [Customer Name],</p>
                <p>
                  Thank you for taking the time to join this demo today. I'm excited to show you how our product can
                  help solve the challenges you mentioned in our previous conversation.
                </p>
                <p>
                  Before we dive in, I'd like to quickly confirm the key pain points you mentioned: you're struggling
                  with [Pain Point 1] and [Pain Point 2]. Is that correct? Are there any other challenges you'd like to
                  address today?
                </p>
                <p>
                  <span className="bg-green-100">
                    Great. Our platform has helped companies in the [Customer's Industry] reduce [Pain Point 1] by 40%
                    and improve [Key Metric] by 25% within the first three months of implementation.
                  </span>
                </p>
                <p>
                  Today I'll be showing you how our solution addresses these specific challenges. Feel free to interrupt
                  me with questions at any point.
                </p>
                <p>Let me start by giving you a quick overview of our platform...</p>
                <p>
                  <span className="bg-green-100">
                    Based on what we've discussed today, I'd recommend scheduling a follow-up call with our
                    implementation specialist to discuss how we can tailor the solution to your specific workflow. Would
                    next Tuesday at 2 PM work for your team?
                  </span>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Enhanced Script
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Script Library</CardTitle>
              <CardDescription>Your saved sales scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Product Demo Script", type: "Product Demo", score: 82, date: "Feb 23, 2023" },
                  { name: "Discovery Call Template", type: "Discovery", score: 78, date: "Feb 15, 2023" },
                  { name: "Follow-up Email Script", type: "Follow-up", score: 90, date: "Feb 10, 2023" },
                  { name: "Objection Handling - Price", type: "Objection", score: 85, date: "Jan 28, 2023" },
                  { name: "Closing Script - Enterprise", type: "Closing", score: 88, date: "Jan 15, 2023" },
                ].map((script, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{script.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {script.type} • {script.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{script.score}%</Badge>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
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

