interface AnalysisRequest {
    conversation: string;
    context?: string;
  }
  
  interface AnalysisResult {
    strengths: string[];
    weaknesses: string[];
    tips: string[];
    overall: string;
    score: number;
  }
  
  export async function analyzeConversation({ 
    conversation, 
    context = ''
  }: AnalysisRequest): Promise<AnalysisResult> {
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation,
          context
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze conversation');
      }
  
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error analyzing conversation:', error);
      throw error;
    }
  }