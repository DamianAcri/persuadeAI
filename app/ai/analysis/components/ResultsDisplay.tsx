"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  overall: string;
  score: number;
  authenticated?: boolean;
  userId?: string;
}

interface ResultsDisplayProps {
  result: AnalysisResult;
  conversation: string;
  context?: string;
}

export default function ResultsDisplay({
  result,
  conversation,
  context,
}: ResultsDisplayProps) {
  // Estado actual
  const [activeTab, setActiveTab] = useState<
    "overview" | "strengths" | "weaknesses" | "tips"
  >("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("🔍 [ResultsDisplay] Sesión al cargar:", data.session ? "Activa" : "Inactiva");
        
        if (data.session) {
          setUser(data.session.user);
          console.log("👤 [ResultsDisplay] Usuario:", data.session.user.id);
        }
      } catch (err) {
        console.error("❌ [ResultsDisplay] Error al verificar sesión:", err);
      }
    };
    
    checkSession();
  }, [supabase]);

  // Function to determine the score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  // Function to determine the progress bar width
  const getProgressWidth = (score: number) => {
    return `${score * 10}%`;
  };

  // Function to save the analysis result - Implementación directa
  const handleSaveResult = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("idle");
      setErrorMessage(null);
      setDebugInfo("");
      
      // Primero verificar que tenemos un usuario autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.user) {
        setErrorMessage("Necesitas iniciar sesión para guardar los resultados");
        setSaveStatus("error");
        setDebugInfo("No hay sesión activa");
        return;
      }
      
      const userId = sessionData.session.user.id;
      setDebugInfo(prev => prev + `\nUsuario autenticado: ${userId}`);
      
      console.log("💾 [ResultsDisplay] Guardando directamente para usuario:", userId);
      
      // Convertir arrays a formato JSON para almacenamiento
      const strengths = JSON.stringify(result.strengths);
      const weaknesses = JSON.stringify(result.weaknesses);
      const tips = JSON.stringify(result.tips);
      
      setDebugInfo(prev => prev + `\nPreparando datos para inserción...`);
      
      // Intentar guardar directamente en la base de datos
      const { data, error } = await supabase
        .from('analysis_results')
        .insert([
          { 
            user_id: userId,
            conversation,
            context: context || "",
            strengths,
            weaknesses,
            tips,
            overall: result.overall,
            score: result.score,
            created_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single();
      
      if (error) {
        console.error("❌ [ResultsDisplay] Error de Supabase:", error);
        setSaveStatus("error");
        
        // Mostrar información detallada del error
        if (error.code === '23503') {
          setErrorMessage("Error de referencia: El usuario no existe en la base de datos");
        } else if (error.code === '42P01') {
          setErrorMessage("Error: La tabla 'analysis_results' no existe");
        } else {
          setErrorMessage(`Error de base de datos: ${error.message}`);
        }
        
        setDebugInfo(prev => prev + `\nError: ${error.code} - ${error.message}`);
        
        // Verificar si la tabla existe
        const { error: tableError } = await supabase
          .from('analysis_results')
          .select('count(*)')
          .limit(1);
        
        if (tableError) {
          setDebugInfo(prev => prev + `\nError comprobando tabla: ${tableError.message}`);
        }
      } else {
        console.log("✅ [ResultsDisplay] Guardado exitosamente:", data);
        setSaveStatus("success");
        setDebugInfo(prev => prev + `\nRegistro guardado con ID: ${data.id}`);
      }
    } catch (error: any) {
      console.error("❌ [ResultsDisplay] Error al guardar:", error);
      setSaveStatus("error");
      setErrorMessage(`Error inesperado: ${error.message}`);
      setDebugInfo(prev => prev + `\nExcepción: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Analysis Results</h3>

          <div className="flex items-center">
            {!user && (
              <div className="flex items-center mr-3">
                <span className="text-yellow-600 text-sm mr-2">
                  Sign in to save results
                </span>
                <button 
                  onClick={handleLoginRedirect}
                  className="text-sm underline text-blue-600"
                >
                  Login
                </button>
              </div>
            )}
            
            {saveStatus === "success" && (
              <span className="text-green-600 mr-3 text-sm">
                Analysis saved successfully!
              </span>
            )}
            
            {saveStatus === "error" && errorMessage && (
              <span className="text-red-600 mr-3 text-sm">
                {errorMessage}
              </span>
            )}
            
            <button
              onClick={handleSaveResult}
              disabled={isSaving || !user}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isSaving || !user
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSaving ? "Saving..." : "Save Analysis"}
            </button>
          </div>
        </div>
      </div>

      {/* Mostrar información de depuración si hay problemas */}
      {debugInfo && (
        <div className="bg-gray-100 border-b border-gray-200 p-2 text-xs">
          <details>
            <summary className="text-gray-700 cursor-pointer">Debug info</summary>
            <pre className="p-2 text-gray-700 overflow-x-auto">
              {debugInfo}
            </pre>
          </details>
        </div>
      )}

      {/* Scorecard */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="mb-4 md:mb-0 md:mr-6 flex-1">
            <h4 className="text-lg font-medium mb-2">Overall Assessment</h4>
            <p className="text-gray-700">{result.overall}</p>
          </div>

          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500 mb-1">
              Persuasion Score
            </span>
            <span
              className={`text-4xl font-bold ${getScoreColor(result.score)}`}
            >
              {result.score}/10
            </span>
          </div>
        </div>
      </div>

      {/* Tabs y contenido restante... */}
      <div className="bg-gray-50 border-b">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("strengths")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "strengths"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Strengths ({result.strengths.length})
          </button>
          <button
            onClick={() => setActiveTab("weaknesses")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "weaknesses"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Areas for Improvement ({result.weaknesses.length})
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "tips"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tips ({result.tips.length})
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6 bg-white">
        {activeTab === "overview" && (
          <div>
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">
                Persuasion Score Breakdown
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: getProgressWidth(result.score) }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor (1-3)</span>
                <span>Average (4-6)</span>
                <span>Good (7-8)</span>
                <span>Excellent (9-10)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h5 className="font-medium text-green-700 mb-2">
                  Key Strengths
                </h5>
                <ul className="space-y-1">
                  {result.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-green-500 mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                  {result.strengths.length > 3 && (
                    <li className="text-sm text-blue-600 mt-2">
                      <button
                        onClick={() => setActiveTab("strengths")}
                        className="hover:underline"
                      >
                        View all {result.strengths.length} strengths
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h5 className="font-medium text-red-700 mb-2">
                  Areas to Improve
                </h5>
                <ul className="space-y-1">
                  {result.weaknesses.slice(0, 3).map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-red-500 mr-2">!</span>
                      {weakness}
                    </li>
                  ))}
                  {result.weaknesses.length > 3 && (
                    <li className="text-sm text-blue-600 mt-2">
                      <button
                        onClick={() => setActiveTab("weaknesses")}
                        className="hover:underline"
                      >
                        View all {result.weaknesses.length} areas
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h5 className="font-medium text-blue-700 mb-2">Top Tips</h5>
                <ul className="space-y-1">
                  {result.tips.slice(0, 3).map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-blue-500 mr-2">→</span>
                      {tip}
                    </li>
                  ))}
                  {result.tips.length > 3 && (
                    <li className="text-sm text-blue-600 mt-2">
                      <button
                        onClick={() => setActiveTab("tips")}
                        className="hover:underline"
                      >
                        View all {result.tips.length} tips
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Resto de las pestañas... */}
        {activeTab === "strengths" && (
          <div>
            <h4 className="font-medium text-green-700 mb-4">Strengths</h4>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-100 text-gray-700 flex"
                >
                  <span className="text-green-500 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "weaknesses" && (
          <div>
            <h4 className="font-medium text-red-700 mb-4">
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="p-3 bg-red-50 rounded-lg border border-red-100 text-gray-700 flex"
                >
                  <span className="text-red-500 mr-2">!</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "tips" && (
          <div>
            <h4 className="font-medium text-blue-700 mb-4">
              Tips for Improvement
            </h4>
            <ul className="space-y-2">
              {result.tips.map((tip, index) => (
                <li
                  key={index}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-gray-700 flex"
                >
                  <span className="text-blue-500 mr-2">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
