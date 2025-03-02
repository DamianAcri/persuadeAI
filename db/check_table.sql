-- Script para verificar la estructura de la tabla analysis_results
-- Ejecuta este script en SQL Editor de Supabase

-- Verificar si la tabla existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'analysis_results'
) AS table_exists;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'analysis_results'
ORDER BY ordinal_position;

-- Verificar las políticas RLS
SELECT * 
FROM pg_policies
WHERE tablename = 'analysis_results';

-- Verificar permisos
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'analysis_results';

-- Crear la tabla si no existe (idempotente, no afectará si ya existe)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation TEXT NOT NULL,
    context TEXT,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    tips TEXT NOT NULL,
    overall TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10)
);

-- Establecer permisos y políticas RLS
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Recrear políticas
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analysis_results;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.analysis_results;

CREATE POLICY "Users can view their own analyses"
  ON public.analysis_results
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own analyses"
  ON public.analysis_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Otorgar permisos
GRANT SELECT, INSERT ON public.analysis_results TO authenticated;
GRANT USAGE ON SEQUENCE public.analysis_results_id_seq TO authenticated;

-- Realizar una inserción de prueba para verificar la tabla
-- (Comenta esta sección después de verificar)
/*
INSERT INTO public.analysis_results 
(user_id, conversation, strengths, weaknesses, tips, overall, score)
SELECT 
  auth.uid(), 
  'Conversación de prueba', 
  '["Fortaleza 1", "Fortaleza 2"]',
  '["Debilidad 1", "Debilidad 2"]',
  '["Consejo 1", "Consejo 2"]',
  'Esta es una evaluación general',
  8
FROM auth.users
WHERE email = 'tu_email@ejemplo.com'
LIMIT 1
RETURNING id;
*/
