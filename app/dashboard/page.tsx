"use client";
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        alert("Error al cerrar sesión: " + error.message);
      } else {
        console.log("Sesión cerrada correctamente");
        router.push('/auth/login');
      }
    } catch (e) {
      console.error("Error inesperado:", e);
      alert("Error inesperado al cerrar sesión");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-2">
      <header className="w-full flex justify-end p-4">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </header>
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Dashboard</h1>
      </main>
    </div>
  );
}