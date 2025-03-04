"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface ScriptAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overall_quality: string;
  persuasiveness_score: number;
  clarity_score: number;
  structure_score: number;
  benefit_focus_score: number;
  authenticity_score: number;
  call_to_action_effectiveness: number;
  authenticated?: boolean;
  userId?: string;
}

interface ScriptResultsDisplayProps {
  result: ScriptAnalysisResult;
  script: string;
  targetAudience?: string;
  productType?: string;
}

export default function ScriptResultsDisplay({
  result,
  script,
  targetAudience,
  productType,
}: ScriptResultsDisplayProps) {
  // Estado actual
  const [activeTab, setActiveTab] = useState<
    "overview" | "strengths" | "weaknesses" | "suggestions" | "detailed_metrics"
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
        console.log("🔍 [ScriptResultsDisplay] Sesión al cargar:", data.session ? "Activa" : "Inactiva");
        
        if (data.session) {
          setUser(data.session.user);
          console.log("👤 [ScriptResultsDisplay] Usuario:", data.session.user.id);
        }
      } catch (err) {
        console.error("❌ [ScriptResultsDisplay] Error al verificar sesión:", err);
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

  // Function to save the script analysis result
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
      
      console.log("💾 [ScriptResultsDisplay] Guardando directamente para usuario:", userId);
      
      // Crear un objeto JSON con las métricas adicionales para almacenar en key_phrases
      // Ahora solo guardamos aquí lo que no tiene columna propia
      const keyPhrases = {
        clarity_score: result.clarity_score,
        structure_score: result.structure_score,
        benefit_focus_score: result.benefit_focus_score,
        authenticity_score: result.authenticity_score,
        call_to_action_effectiveness: result.call_to_action_effectiveness
      };
      
      setDebugInfo(prev => prev + `\nPreparando datos para inserción con campos adicionales...`);
      
      // Intentar guardar en la tabla pitch_summary existente usando todas las columnas disponibles
      const { data, error } = await supabase
        .from('pitch_summary')
        .insert([
          { 
            user_id: userId,
            summary: result.overall_quality, // Resumen general como campo summary
            score: result.persuasiveness_score, // Persuasiveness_score como score principal
            strengths: result.strengths, // Ya es un array
            weaknesses: result.weaknesses, // Ya es un array
            recommendations: result.suggestions, // Mapear sugerencias a recomendaciones
            key_phrases: keyPhrases, // Solo métricas detalladas sin columna propia
            created_at: new Date().toISOString(),
            // Añadir los nuevos campos
            conversation: script, // Texto completo del script
            target_audience: targetAudience || "", // Público objetivo
            product_service: productType || "" // Tipo de producto/servicio
          }
        ])
        .select('id')
        .single();
      
      if (error) {
        console.error("❌ [ScriptResultsDisplay] Error de Supabase:", error);
        setSaveStatus("error");
        
        // Mostrar información detallada del error
        if (error.code === '23503') {
          setErrorMessage("Error de referencia: El usuario no existe en la base de datos");
        } else if (error.code === '42P01') {
          setErrorMessage("Error: La tabla no existe");
        } else if (error.code === '42703') {
          setErrorMessage(`Error: Columna no existe. Detalles: ${error.message}`);
          setDebugInfo(prev => prev + `\nError de columna: ${error.message}`);
        } else {
          setErrorMessage(`Error de base de datos: ${error.message}`);
        }
        
        setDebugInfo(prev => prev + `\nError: ${error.code} - ${error.message}`);
      } else {
        console.log("✅ [ScriptResultsDisplay] Guardado exitosamente:", data);
        setSaveStatus("success");
        setDebugInfo(prev => prev + `\nRegistro guardado con ID: ${data.id}`);
      }
    } catch (error: any) {
      console.error("❌ [ScriptResultsDisplay] Error al guardar:", error);
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

  // Function to render metric gauge
  const renderMetricGauge = (label: string, value: number) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-medium ${getScoreColor(value)}`}>{value.toFixed(1)}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${value >= 8 ? 'bg-green-600' : value >= 6 ? 'bg-blue-600' : value >= 4 ? 'bg-yellow-600' : 'bg-red-600'}`}
            style={{ width: getProgressWidth(value) }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Script Analysis Results</h3>

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
            <p className="text-gray-700">{result.overall_quality}</p>
          </div>

          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500 mb-1">
              Persuasiveness Score
            </span>
            <span
              className={`text-4xl font-bold ${getScoreColor(result.persuasiveness_score)}`}
            >
              {result.persuasiveness_score}/10
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-50 border-b">
        <nav className="flex flex-wrap">
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
            onClick={() => setActiveTab("detailed_metrics")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "detailed_metrics"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Detailed Metrics
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
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "suggestions"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Suggestions ({result.suggestions.length})
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6 bg-white">
        {activeTab === "overview" && (
          <div>
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">
                Persuasiveness Score Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {renderMetricGauge("Clarity", result.clarity_score)}
                  {renderMetricGauge("Structure", result.structure_score)}
                  {renderMetricGauge("Benefit Focus", result.benefit_focus_score)}
                </div>
                <div>
                  {renderMetricGauge("Authenticity", result.authenticity_score)}
                  {renderMetricGauge("Call to Action", result.call_to_action_effectiveness)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">Script Analysis Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">
                    Key Strengths
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {result.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                    {result.strengths.length > 3 && (
                      <li className="list-none">
                        <button
                          onClick={() => setActiveTab("strengths")}
                          className="text-blue-600 hover:underline mt-1"
                        >
                          See all {result.strengths.length} strengths
                        </button>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">
                    Areas for Improvement
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {result.weaknesses.slice(0, 3).map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                    {result.weaknesses.length > 3 && (
                      <li className="list-none">
                        <button
                          onClick={() => setActiveTab("weaknesses")}
                          className="text-blue-600 hover:underline mt-1"
                        >
                          See all {result.weaknesses.length} improvement areas
                        </button>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">
                    Top Suggestions
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {result.suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                    {result.suggestions.length > 3 && (
                      <li className="list-none">
                        <button
                          onClick={() => setActiveTab("suggestions")}
                          className="text-blue-600 hover:underline mt-1"
                        >
                          See all {result.suggestions.length} suggestions
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "detailed_metrics" && (
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Detailed Metrics Analysis</h4>
            
            <div className="space-y-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Clarity Score: {result.clarity_score}/10</h5>
                <p className="text-gray-600 mb-2">
                  Measures how easily your audience can understand your message. 
                  Clear scripts use simple language, avoid jargon, and present ideas logically.
                </p>
                {renderMetricGauge("Clarity", result.clarity_score)}
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Structure Score: {result.structure_score}/10</h5>
                <p className="text-gray-600 mb-2">
                  Evaluates how well your script flows from beginning to end.
                  Well-structured scripts have a clear introduction, body, and conclusion.
                </p>
                {renderMetricGauge("Structure", result.structure_score)}
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Benefit Focus Score: {result.benefit_focus_score}/10</h5>
                <p className="text-gray-600 mb-2">
                  Measures how well your script emphasizes benefits rather than features.
                  Effective scripts connect product attributes to audience needs.
                </p>
                {renderMetricGauge("Benefit Focus", result.benefit_focus_score)}
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Authenticity Score: {result.authenticity_score}/10</h5>
                <p className="text-gray-600 mb-2">
                  Evaluates how genuine and trustworthy your script sounds.
                  Authentic scripts avoid hyperbole and build credibility.
                </p>
                {renderMetricGauge("Authenticity", result.authenticity_score)}
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Call to Action Effectiveness: {result.call_to_action_effectiveness}/10</h5>
                <p className="text-gray-600 mb-2">
                  Measures how effectively your script motivates the audience to take action.
                  Strong CTAs are clear, specific, and create a sense of urgency.
                </p>
                {renderMetricGauge("Call to Action", result.call_to_action_effectiveness)}
              </div>
            </div>
          </div>
        )}

        {activeTab === "strengths" && (
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Identified Strengths</h4>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block mr-2 mt-1 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "weaknesses" && (
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Areas for Improvement</h4>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block mr-2 mt-1 text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "suggestions" && (
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Improvement Suggestions</h4>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block mr-2 mt-1 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                  </span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Script Preview Section */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Original Script</h4>
          {targetAudience && productType && (
            <div className="mb-3 flex gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Target Audience:</span> {targetAudience}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Product Type:</span> {productType}
              </div>
            </div>
          )}
          <div className="bg-white p-4 border rounded-md text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {script}
          </div>
        </div>
      </div>
    </div>
  );
}