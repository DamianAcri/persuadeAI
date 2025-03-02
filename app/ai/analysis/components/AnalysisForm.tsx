// app/ai/analysis/components/AnalysisForm.tsx

"use client";

import { useState, useEffect } from 'react';
import { analyzeConversation } from '@/app/ai/analysis/service/analysisService';
import ResultsDisplay from '@/app/ai/analysis/components/ResultsDisplay';
import { FileUploadHandler } from '@/app/ai/analysis/components/FileUploadHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkSupabaseSession } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AnalysisFormProps {
  initialConversation?: string;
  initialMethod?: string;
}
export default function AnalysisForm({ initialConversation = '', initialMethod = 'paste' }: AnalysisFormProps) {
  const supabase = createClientComponentClient();
  const [conversation, setConversation] = useState<string>(initialConversation);
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<string>(initialMethod);
  const [fileUploaded, setFileUploaded] = useState<boolean>(!!initialConversation && initialMethod === 'upload');
  const [sessionStatus, setSessionStatus] = useState({ checked: false, exists: false });

  // Effect to update the conversation state if initialConversation changes
  useEffect(() => {
    if (initialConversation) {
      setConversation(initialConversation);
      setInputMethod(initialMethod);
      // If we have initial text and method is upload, consider file as uploaded
      setFileUploaded(!!initialConversation && initialMethod === 'upload');
    }
  }, [initialConversation, initialMethod]);

  // Verificar la sesión al cargar el componente
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { hasSession, userId } = await checkSupabaseSession();
        setSessionStatus({ checked: true, exists: hasSession });
        
        console.log(`🔍 [AnalysisForm] Estado de sesión: ${hasSession ? 'Activa ✅' : 'Inactiva ❌'}, Usuario: ${userId || 'No autenticado'}`);
        
        // Si hay sesión, verificar detalles para depuración
        if (hasSession) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log(`🕒 [AnalysisForm] Token expira: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`);
            console.log(`🔑 [AnalysisForm] Token actual:`, data.session.access_token.substring(0, 10) + '...');
          }
        }
      } catch (error) {
        console.error('❌ [AnalysisForm] Error verificando sesión:', error);
      }
    };
    
    verifySession();
    // Verificar la sesión cada 30 segundos
    const interval = setInterval(verifySession, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation.trim()) {
      setError('Please enter a conversation or upload a file');
      return;
    }
    
    // Verificar explícitamente la sesión antes de enviar
    try {
      console.log('🔄 [AnalysisForm] Verificando sesión antes de enviar...');
      
      // Actualizar la sesión si es necesario
      const { data: authData } = await supabase.auth.getSession();
      if (authData.session) {
        console.log('✅ [AnalysisForm] Sesión válida antes de análisis:', authData.session.user.id);
      } else {
        console.log('⚠️ [AnalysisForm] No hay sesión activa antes de análisis');
      }
      
      setLoading(true);
      setError(null);
      
      const analysisResult = await analyzeConversation({
        conversation,
        context
      });
      
      // Verificar si el resultado indica autenticación
      if (analysisResult) {
        console.log(`🔐 [AnalysisForm] Análisis completado - Autenticado: ${analysisResult.authenticated ? 'Sí' : 'No'}`);
      }
      
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || 'Error analyzing conversation. Please try again.');
      console.error('❌ [AnalysisForm] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextExtracted = (text: string) => {
    setConversation(text);
    setFileUploaded(true); // Mark that a file has been uploaded and processed
  };

  const handleTabChange = (value: string) => {
    setInputMethod(value);
    // Reset file uploaded state when switching back to upload tab
    if (value === 'upload' && !fileUploaded) {
      setConversation(''); // Clear conversation when switching to upload if no file is uploaded
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-2">Analyze Your Conversation</h2>
        <p className="text-sm text-gray-500">Using GPT-4o-mini for analysis</p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide context about the conversation (e.g., sales pitch for software, negotiation for pricing)"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">
              Adding context helps the AI understand the situation better.
            </p>
          </div>
          
          <div className="mb-6">
            <Tabs value={inputMethod} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="paste">Paste Conversation</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={conversation}
                  onChange={(e) => setConversation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste your conversation here... Example: 
                  
Salesperson: Hi there! I noticed you've been looking at our premium software package. Is there anything specific you're interested in?
Customer: Just browsing for now. Your prices seem a bit high compared to others.
Salesperson: I understand price is important. What features are you specifically looking for? I might be able to recommend a more suitable package."
                  rows={8}
                  required={inputMethod === 'paste'}
                />
              </TabsContent>
              
              <TabsContent value="upload">
                {!fileUploaded ? (
                  <FileUploadHandler onTextExtracted={handleTextExtracted} />
                ) : (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Extracted Conversation
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFileUploaded(false);
                          setConversation('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Upload Another File
                      </button>
                    </div>
                    <textarea
                      value={conversation}
                      onChange={(e) => setConversation(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={8}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You can edit the extracted text if needed before analysis.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || !conversation.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Conversation'
              )}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {result && <ResultsDisplay result={result} conversation={conversation} context={context} />}
      </div>
    </div>
  );
}