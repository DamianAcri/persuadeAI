-- Este script crea la tabla analysis_results si no existe
-- Puedes ejecutarlo manualmente en la interfaz de Supabase SQL Editor

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation TEXT NOT NULL,
    context TEXT,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    tips TEXT NOT NULL,
    overall TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10)
);

-- Crear índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON public.analysis_results(user_id);

-- Crear políticas RLS para seguridad
BEGIN;
  -- Eliminar políticas existentes para evitar errores
  DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analysis_results;
  DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.analysis_results;
  
  -- Habilitar RLS
  ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
  
  -- Crear políticas
  CREATE POLICY "Users can view their own analyses"
    ON public.analysis_results
    FOR SELECT
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own analyses"
    ON public.analysis_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
COMMIT;

-- Otorgar permisos
GRANT SELECT, INSERT ON public.analysis_results TO authenticated;
GRANT USAGE ON SEQUENCE public.analysis_results_id_seq TO authenticated;
