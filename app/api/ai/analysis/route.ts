import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { conversation, context } = await req.json();
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation is required' },
        { status: 400 }
      );
    }
    
    const prompt = `
Please analyze the following sales/persuasion conversation and provide feedback:

CONTEXT:
${context || 'No additional context provided.'}

CONVERSATION:
${conversation}

Please provide your analysis in the following JSON format:
{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "tips": ["tip1", "tip2", ...],
  "overall": "overall assessment",
  "score": numeric_score_between_1_and_10
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in sales and persuasion techniques. Analyze the conversation and provide detailed feedback.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Extraer el JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let analysisResult;
    
    if (jsonMatch) {
      analysisResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse response');
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error('Error in analysis API:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze conversation',
        details: error.message
      },
      { status: 500 }
    );
  }
}







































































