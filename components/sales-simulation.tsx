"use client"

import { useState } from "react"
import { BarChart3, Clock, Play, Plus, Settings, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function SalesSimulation() {
  const [activeTab, setActiveTab] = useState("scenarios")
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isSimulationActive, setIsSimulationActive] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)

  const scenarios = [
    {
      id: "discovery",
      name: "Discovery Call",
      description: "Practice identifying customer needs and pain points",
      difficulty: "Beginner",
      duration: "10-15 min",
      customer: "Tech Startup CMO",
    },
    {
      id: "objection",
      name: "Objection Handling",
      description: "Practice overcoming common sales objections",
      difficulty: "Intermediate",
      duration: "5-10 min",
      customer: "Enterprise Procurement Manager",
    },
    {
      id: "demo",
      name: "Product Demo",
      description: "Practice showcasing product features and benefits",
      difficulty: "Advanced",
      duration: "15-20 min",
      customer: "Healthcare IT Director",
    },
    {
      id: "closing",
      name: "Closing Techniques",
      description: "Practice closing deals and securing commitments",
      difficulty: "Expert",
      duration: "10-15 min",
      customer: "CFO of Mid-size Manufacturing Company",
    },
  ]

  const startScenario = (scenarioId: string) => {
    setActiveScenario(scenarioId)
    setActiveTab("simulation")
    setIsSimulationActive(true)
    setSimulationComplete(false)
    setMessages([
      {
        role: "system",
        content: "Welcome to the simulation. I'll be playing the role of the customer. Let's begin the conversation.",
      },
      {
        role: "assistant",
        content: "Hello there! I'm Sarah, the CMO at TechStart. I scheduled this call because we're looking for a solution to help with our marketing automation. We're growing quickly and our current processes aren't scaling well. What can you tell me about your solution?",
      },
    ])
  }

  const sendMessage = () => {
    if (!inputValue.trim()) return

    const newMessages = [
      ...messages,
      { role: "user", content: inputValue },
    ]
    
    setMessages(newMessages)
    setInputValue("")
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      let aiResponse
      
      if (newMessages.length < 6) {
        aiResponse = "That's interesting. We've been trying several tools but none of them integrate well with our CRM. How does your solution handle integration with Salesforce?"
      } else if (newMessages.length < 10) {
        aiResponse = "The integration sounds promising, but I'm concerned about the pricing. It seems a bit high for a company our size. Do you offer any flexible pricing options for startups?"
      } else {
        aiResponse = "I appreciate all this information. I think I have a good understanding of your solution now. I need to discuss this with my team before making a decision. Could you send me some additional information about the implementation process?"
        
        // End simulation after this message
        setTimeout(() => {
          setIsSimulationActive(false)
          setSimulationComplete(true)
        }, 1000)
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }])
    }, 1000)
  }

  const resetSimulation = () => {
    setActiveScenario(null)
    setActiveTab("scenarios")
    setMessages([])
    setIsSimulationActive(false)
    setSimulationComplete(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Simulations</h1>
          <p className="text-muted-foreground">Practice your sales techniques with AI-powered simulations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            History
          </Button>
          {activeScenario && (
            <Button onClick={resetSimulation}>
              <Plus className="mr-2 h-4 w-4" />
              New Simulation
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="simulation" disabled={!activeScenario}>Simulation</TabsTrigger>
          {simulationComplete && <TabsTrigger value="feedback">Feedback</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{scenario.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {scenario.duration}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Customer Profile:</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <UserCircle2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{scenario.customer}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => startScenario(scenario.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Simulation
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="simulation" className="space-y-4">
          {activeScenario && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <UserCircle2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">
                    {scenarios.find(s => s.id === activeScenario)?.customer}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {messages.filter(m => m.role !== "system").map((message, i) => (
                    <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                
                {isSimulationActive && (
                  <div className="flex gap-2 mt-4">
                    <input
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="Type your response..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage}>Send</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Feedback</CardTitle>
              <CardDescription>Analysis of your performance in this sales simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Good initial engagement with the customer</li>
                    <li>Effective handling of pricing objections</li>
                    <li>Clear explanation of product features</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Could ask more discovery questions</li>
                    <li>Opportunity to address specific pain points more directly</li>
                    <li>Consider offering a stronger closing technique</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={resetSimulation} className="w-full">
                Start New Simulation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}