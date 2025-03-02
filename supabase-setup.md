# Supabase Setup Instructions for PersuadeAI

This document contains the SQL commands needed to set up the necessary tables in your Supabase project.

## Required Tables

For the application to function properly, you need to create the following tables:

### 1. user_stats

Stores user performance statistics and metrics.

```sql
CREATE TABLE IF NOT EXISTS public.user_stats (
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

-- Set up row-level security
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" 
  ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own stats" 
  ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own stats" 
  ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. user_activities

Stores user activity history.

```sql
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up row-level security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" 
  ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own activities" 
  ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. user_performance

Stores performance metrics over time.

```sql
CREATE TABLE IF NOT EXISTS public.user_performance (
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

-- Set up row-level security
ALTER TABLE public.user_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance" 
  ON public.user_performance
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own performance" 
  ON public.user_performance
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Helper Functions

These functions allow the application to programmatically create tables if they don't exist.

```sql
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
```

## Installation Steps

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Create a new query
4. Paste the SQL commands for each table you need to create
5. Execute the query
6. Verify the tables were created by checking the Table Editor

## Troubleshooting

If you encounter a "relation does not exist" error in your application, it's because one or more of these tables need to be created. Follow the installation steps above or navigate to `/setup` in your application if you have administrator access.
