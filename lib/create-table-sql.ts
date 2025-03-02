/**
 * SQL statements for creating tables that might be missing
 */

export const CREATE_USER_STATS_TABLE = `
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total_conversations INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  simulations INTEGER DEFAULT 0,
  practice_time_minutes INTEGER DEFAULT 0,
  objection_handling INTEGER DEFAULT 0,
  active_listening INTEGER DEFAULT 0,
  value_proposition INTEGER DEFAULT 0,
  closing_techniques INTEGER DEFAULT 0,
  rapport_building INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
`;

export const CREATE_USER_ACTIVITIES_TABLE = `
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
`;

export const CREATE_USER_PERFORMANCE_TABLE = `
CREATE TABLE IF NOT EXISTS user_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  month VARCHAR(3) NOT NULL,
  objection_handling INTEGER DEFAULT 0,
  active_listening INTEGER DEFAULT 0,
  value_proposition INTEGER DEFAULT 0,
  closing_techniques INTEGER DEFAULT 0,
  rapport_building INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
`;

/**
 * Supabase RPC function to create the tables if you have permissions
 * This should be added to your Supabase project's SQL editor
 */
export const CREATE_TABLE_FUNCTIONS = `
-- Function to create user_stats table if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_stats_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats'
  ) THEN
    -- Create the table
    CREATE TABLE public.user_stats (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      total_conversations INTEGER DEFAULT 0,
      average_score INTEGER DEFAULT 0,
      simulations INTEGER DEFAULT 0,
      practice_time_minutes INTEGER DEFAULT 0,
      objection_handling INTEGER DEFAULT 0,
      active_listening INTEGER DEFAULT 0,
      value_proposition INTEGER DEFAULT 0,
      closing_techniques INTEGER DEFAULT 0,
      rapport_building INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Set RLS policies
    ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view own stats" ON public.user_stats
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can update own stats" ON public.user_stats
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert own stats" ON public.user_stats
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    RETURN true;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to execute arbitrary SQL (dangerous - only for database owners)
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;
`;
