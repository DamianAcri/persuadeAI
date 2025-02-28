"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, ChevronDown, Mic, MicOff, Settings, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FeedbackSettings {
  tone: boolean;
  clarity: boolean;
  objections: boolean;
  pacing: boolean;
  questions: boolean;
}

interface RealTimeAssistanceProps {}

export function RealTimeAssistance(props: RealTimeAssistanceProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("live");
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>({
    tone: true,
    clarity: true,
    objections: true,
    pacing: true,
    questions: true,
  });

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Assistance</h1>
          <p className="text-muted-foreground">Get live feedback during your sales calls</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setFeedbackVisible(!feedbackVisible)}>
            {feedbackVisible ? "Hide" : "Show"} Feedback
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Assistance</TabsTrigger>
          <TabsTrigger value="settings">Feedback Settings</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Live Call</CardTitle>
                  <CardDescription>Your active sales call with real-time feedback</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  {isRecording ? (
                    <div className="text-center">
                      <div className="relative inline-flex">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                        <div className="relative rounded-full bg-primary p-6">
                          <Mic className="h-12 w-12 text-primary-foreground" />
                        </div>
                      </div>
                      <p className="mt-4 text-lg font-medium">Recording in progress...</p>
                      <p className="text-sm text-muted-foreground">00:03:45</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="rounded-full bg-muted p-6 inline-block">
                        <MicOff className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-lg font-medium">Ready to start</p>
                      <p className="text-sm text-muted-foreground">Click the button below to begin recording</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" disabled={!isRecording}>
                      <Volume2 className="mr-2 h-5 w-5" />
                      Mute
                    </Button>
                    <Button 
                      size="lg" 
                      className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
                      onClick={toggleRecording}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-5 w-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-5 w-5" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {feedbackVisible && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Live Feedback</CardTitle>
                  <CardDescription>AI-powered suggestions in real-time</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-4">
                  {isRecording ? (
                    <>
                      <div className="rounded-md border bg-amber-50 p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <p className="text-sm font-medium text-amber-600">Pacing too fast</p>
                        </div>
                        <p className="mt-1 text-xs text-amber-700">
                          Try slowing down your speech to improve clarity and give the customer time to process information.
                        </p>
                      </div>

                      <div className="rounded-md border bg-green-50 p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-600">Great discovery question</p>
                        </div>
                        <p className="mt-1 text-xs text-green-700">
                          "What specific challenges are you facing with your current solution?" is an excellent open-ended question.
                        </p>
                      </div>

                      <div className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Suggested response</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          "I understand your concern about the pricing. Many of our customers initially felt the same way, but found that the ROI within the first 6 months justified the investment."
                        </p>
                      </div>

                      <div className="rounded-md border bg-amber-50 p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <p className="text-sm font-medium text-amber-600">Technical jargon detected</p>
                        </div>
                        <p className="mt-1 text-xs text-amber-700">
                          Terms like "API integration" and "middleware" may need explanation for this audience.
                        </p>
                      </div>

                      <div className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Customer sentiment</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          The customer's tone indicates hesitation. Consider addressing concerns directly before proceeding.
                        </p>
                      </div>

                      <div className="rounded-md border bg-green-50 p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-600">Effective value proposition</p>
                        </div>
                        <p className="mt-1 text-xs text-green-700">
                          Your explanation of how the solution saves 5 hours per week was clear and compelling.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-muted p-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-sm font-medium">No active recording</p>
                      <p className="text-xs text-muted-foreground">Start recording to see real-time feedback</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Summary</CardTitle>
              <CardDescription>Key metrics and insights from your current call</CardDescription>
            </CardHeader>
            <CardContent>
              {isRecording ? (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Talk Ratio</p>
                    <div className="flex h-2 w-full gap-1">
                      <div className="h-2 w-[45%] rounded-l-full bg-primary"></div>
                      <div className="h-2 w-[55%] rounded-r-full bg-primary/30"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">You: 45% | Customer: 55%</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pace</p>
                    <div className="flex h-2 w-full">
                      <div className="h-2 w-[75%] rounded-l-full bg-amber-500"></div>
                      <div className="h-2 w-[25%] rounded-r-full bg-muted"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">175 words/min (Slightly fast)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Filler Words</p>
                    <div className="flex h-2 w-full">
                      <div className="h-2 w-[30%] rounded-l-full bg-green-500"></div>
                      <div className="h-2 w-[70%] rounded-r-full bg-muted"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">12 instances (Low)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Questions Asked</p>
                    <div className="flex h-2 w-full">
                      <div className="h-2 w-[60%] rounded-l-full bg-primary"></div>
                      <div className="h-2 w-[40%] rounded-r-full bg-muted"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">6 questions (Good engagement)</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-sm text-muted-foreground">Start recording to see call metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Preferences</CardTitle>
              <CardDescription>Customize what feedback you receive during calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tone and Sentiment</p>
                    <p className="text-sm text-muted-foreground">Feedback on your emotional tone and customer sentiment</p>
                  </div>
                  <Switch 
                    checked={feedbackSettings.tone} 
                    onCheckedChange={(checked: any) => setFeedbackSettings({...feedbackSettings, tone: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clarity and Language</p>
                    <p className="text-sm text-muted-foreground">Feedback on jargon, clarity, and explanation quality</p>
                  </div>
                  <Switch 
                    checked={feedbackSettings.clarity} 
                    onCheckedChange={(checked: any) => setFeedbackSettings({...feedbackSettings, clarity: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Objection Handling</p>
                    <p className="text-sm text-muted-foreground">Suggestions for addressing customer concerns</p>
                  </div>
                  <Switch 
                    checked={feedbackSettings.objections} 
                    onCheckedChange={(checked: any) => setFeedbackSettings({...feedbackSettings, objections: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pacing and Timing</p>
                    <p className="text-sm text-muted-foreground">Feedback on speech rate and conversation flow</p>
                  </div>
                  <Switch 
                    checked={feedbackSettings.pacing} 
                    onCheckedChange={(checked: any) => setFeedbackSettings({...feedbackSettings, pacing: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Question Quality</p>
                    <p className="text-sm text-muted-foreground">Feedback on discovery and qualifying questions</p>
                  </div>
                  <Switch 
                    checked={feedbackSettings.questions} 
                    onCheckedChange={(checked: any) => setFeedbackSettings({...feedbackSettings, questions: checked})} 
                  />
                </div>
              </div>
              
              <Collapsible className="space-y-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4">
                  <span className="font-medium">Advanced Settings</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 rounded-md border p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Feedback Frequency</p>
                    <p className="text-xs text-muted-foreground">How often you receive suggestions during calls</p>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Only critical feedback</SelectItem>
                        <SelectItem value="medium">Medium - Balanced feedback</SelectItem>
                        <SelectItem value="high">High - Comprehensive feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Voice Volume</p>
                    <p className="text-xs text-muted-foreground">Volume of audio feedback (if enabled)</p>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Feedback Display</p>
                    <p className="text-xs text-muted-foreground">How feedback appears on screen</p>
                    <Select defaultValue="sidebar">
                      <SelectTrigger>
                        <SelectValue placeholder="Select display mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sidebar">Sidebar panel</SelectItem>
                        <SelectItem value="floating">Floating notifications</SelectItem>
                        <SelectItem value="minimal">Minimal indicators</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Your previous real-time assistance sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <Mic className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sales Call - Client {item}</p>
                        <p className="text-xs text-muted-foreground">Feb {20 - item}, 2023 • {10 + item} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{70 + item}%</Badge>
                      <Button variant="outline" size="sm">View Summary</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}