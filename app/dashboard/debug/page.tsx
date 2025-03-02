"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DebugPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        loadTables();
      }
    };

    checkAuth();
  }, [supabase]);

  const loadTables = async () => {
    try {
      // Usar una consulta para listar tablas del esquema público
      const { data, error } = await supabase.rpc('get_tables', {});
      
      if (error) {
        setTableError(`Error al obtener tablas: ${error.message}`);
        return;
      }
      
      if (data) {
        setTables(data);
      }
    } catch (err: any) {
      setTableError(`Error al cargar tablas: ${err.message}`);
    }
  };

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .limit(5);
      
      if (error) {
        setTableError(`Error al consultar resultados: ${error.message}`);
      } else {
        setAnalysisResults(data || []);
      }
    } catch (err: any) {
      setTableError(`Excepción al cargar resultados: ${err.message}`);
    }
  };

  const testInsert = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      if (!user) {
        setTestResult("Error: Necesitas iniciar sesión para realizar la prueba");
        return;
      }
      
      const testData = {
        user_id: user.id,
        conversation: "Esto es una prueba",
        strengths: JSON.stringify(["Prueba 1", "Prueba 2"]),
        weaknesses: JSON.stringify(["Debilidad prueba 1"]),
        tips: JSON.stringify(["Consejo prueba 1"]),
        overall: "Evaluación de prueba",
        score: 7
      };
      
      console.log("Intentando inserción de prueba:", testData);
      
      const { data, error } = await supabase
        .from('analysis_results')
        .insert([testData])
        .select()
        .single();
        
      if (error) {
        setTestResult(`Error en inserción: ${error.code} - ${error.message}`);
        console.error("Error de inserción:", error);
      } else {
        setTestResult(`Inserción exitosa. ID: ${data.id}`);
        loadResults(); // Recargar resultados
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Página de depuración</h1>
        <p className="mt-4">Por favor inicia sesión para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Página de depuración de base de datos</h1>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Información de usuario</h2>
        <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-w-full">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Tablas disponibles</h2>
        {tableError && (
          <div className="mt-2 text-red-600">
            {tableError}
          </div>
        )}
        <ul className="mt-2 list-disc pl-5">
          {tables.map((table, idx) => (
            <li key={idx}>{table}</li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Prueba de inserción</h2>
        <button
          onClick={testInsert}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Insertando..." : "Insertar registro de prueba"}
        </button>
        {testResult && (
          <div className={`mt-2 p-2 rounded-md ${testResult.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {testResult}
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Resultados guardados</h2>
        <button
          onClick={loadResults}
          className="mt-2 mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Cargar últimos resultados
        </button>
        
        {analysisResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysisResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{result.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(result.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.score}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay resultados disponibles</p>
        )}
      </div>
    </div>
  );
}
