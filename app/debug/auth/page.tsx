"use client";
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-browser';
import { Session, User } from '@supabase/supabase-js';

export default function AuthDebugPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authCookies, setAuthCookies] = useState<string[]>([]);
  const supabase = getSupabaseClient();
  
  // Verificar autenticación al cargar
  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        setError(null);
        
        // Intentar obtener la sesión
        const { data, error } = await supabase.auth.getSession();
        
        // Manejar errores
        if (error) {
          setError(error.message);
          return;
        }
        
        // Actualizar estado
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Intentar detectar cookies de autenticación
        const allCookies = document.cookie.split('; ');
        const authRelatedCookies = allCookies.filter(cookie => 
          cookie.includes('supabase') || 
          cookie.includes('sb-') || 
          cookie.includes('auth')
        );
        
        setAuthCookies(authRelatedCookies);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [supabase]);
  
  // Funciones de acción
  const handleRefresh = async () => {
    window.location.reload();
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
  
  const handleSignIn = async () => {
    try {
      // Redirigir al login usando Next.js auth-helpers
      window.location.href = '/auth/login?returnUrl=/debug/auth';
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Verificando autenticación...</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Depuración de autenticación</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-4">
            <h2 className="font-bold text-lg">Error</h2>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Estado de autenticación</h2>
          
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="font-medium">{user ? 'Autenticado' : 'No autenticado'}</p>
          </div>
          
          {user && (
            <div className="mb-4">
              <p><span className="font-medium">ID:</span> {user.id}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Último inicio de sesión:</span> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Actualizar
            </button>
            
            {user ? (
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            ) : (
              <button 
                onClick={handleSignIn}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
        
        {session && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium mb-2">Información de sesión</h2>
            <p><span className="font-medium">Token de acceso:</span> {session.access_token.substring(0, 20)}...</p>
            <p><span className="font-medium">Token de actualización:</span> {session.refresh_token ? (session.refresh_token.substring(0, 10) + '...') : 'No disponible'}</p>
            
            <div className="mt-3">
              <h3 className="font-medium">Caducidad de sesión:</h3>
              {session.expires_at && (
                <p className="mb-1">
                  {new Date(session.expires_at * 1000).toLocaleString()} 
                  <span className="ml-2 text-sm text-gray-500">
                    ({Math.round((session.expires_at * 1000 - Date.now()) / 60000)} minutos restantes)
                  </span>
                </p>
              )}
              <p className="text-sm text-gray-600">La sesión se renovará automáticamente si está configurado así.</p>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">Cookies de autenticación</h2>
          
          {authCookies.length > 0 ? (
            <ul className="list-disc pl-5">
              {authCookies.map((cookie, index) => (
                <li key={index} className="mb-1">
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{cookie}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No se encontraron cookies de autenticación.</p>
          )}
          
          <div className="mt-4 p-3 border border-yellow-300 bg-yellow-50 rounded">
            <h3 className="font-medium text-yellow-800">¿Problemas con las cookies?</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Asegúrate de que tu navegador no esté bloqueando cookies de terceros y que no tengas 
              extensiones que limpien cookies automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
