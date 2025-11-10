-- =====================================================
-- SAFE RLS POLICIES - Only for existing tables
-- =====================================================
-- This migration fixes RLS policies only for tables that exist
-- =====================================================

-- First, let's check what tables exist and enable RLS only on existing ones
-- Enable RLS on existing tables (safe approach)
DO $$
DECLARE
    tbl_name text;
    tables_to_check text[] := ARRAY['followup', 'chats', 'chats_new', 'n8n_chat_histories', 'documents', 'conversation_analysis'];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) THEN
            -- Enable RLS on existing table
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'RLS enabled on table: %', tbl_name;
        ELSE
            RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Drop existing insecure policies (safe approach)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies that use USING (true) - these are insecure
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND qual = 'true'
    LOOP
        -- Drop insecure policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped insecure policy: %.%', policy_record.tablename, policy_record.policyname;
    END LOOP;
END $$;

-- Create secure policies only for existing tables
-- FOLLOWUP TABLE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followup') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Permitir leitura pública followup" ON public.followup;
        DROP POLICY IF EXISTS "Admins can view all followup data" ON public.followup;
        
        -- Create secure policy
        CREATE POLICY "Authenticated users can read followup"
          ON public.followup
          FOR SELECT
          USING (auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can insert followup"
          ON public.followup
          FOR INSERT
          WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can update followup"
          ON public.followup
          FOR UPDATE
          USING (auth.role() = 'authenticated');
          
        RAISE NOTICE 'Created secure policies for followup table';
    END IF;
END $$;

-- CHATS TABLE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chats') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Permitir leitura pública chats" ON public.chats;
        DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;
        
        -- Create secure policy
        CREATE POLICY "Authenticated users can read chats"
          ON public.chats
          FOR SELECT
          USING (auth.role() = 'authenticated');
          
        RAISE NOTICE 'Created secure policies for chats table';
    END IF;
END $$;

-- CHATS_NEW TABLE (only if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chats_new') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Permitir leitura pública chats_new" ON public.chats_new;
        DROP POLICY IF EXISTS "Admins can view all chats_new" ON public.chats_new;
        
        -- Create secure policy
        CREATE POLICY "Authenticated users can read chats_new"
          ON public.chats_new
          FOR SELECT
          USING (auth.role() = 'authenticated');
          
        RAISE NOTICE 'Created secure policies for chats_new table';
    ELSE
        RAISE NOTICE 'chats_new table does not exist, skipping';
    END IF;
END $$;

-- N8N_CHAT_HISTORIES TABLE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'n8n_chat_histories') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.n8n_chat_histories;
        DROP POLICY IF EXISTS "Admins can view chat histories" ON public.n8n_chat_histories;
        
        -- Create secure policy
        CREATE POLICY "Authenticated users can read chat histories"
          ON public.n8n_chat_histories
          FOR SELECT
          USING (auth.role() = 'authenticated');

        CREATE POLICY "Service role can manage chat histories"
          ON public.n8n_chat_histories
          FOR ALL
          USING (auth.jwt() ->> 'role' = 'service_role');
          
        RAISE NOTICE 'Created secure policies for n8n_chat_histories table';
    END IF;
END $$;

-- DOCUMENTS TABLE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.documents;
        DROP POLICY IF EXISTS "Admins can view documents" ON public.documents;
        
        -- Create secure policy
        CREATE POLICY "Authenticated users can read documents"
          ON public.documents
          FOR SELECT
          USING (auth.role() = 'authenticated');
          
        RAISE NOTICE 'Created secure policies for documents table';
    END IF;
END $$;

-- CONVERSATION_ANALYSIS TABLE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_analysis') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.conversation_analysis;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.conversation_analysis;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.conversation_analysis;
        
        -- Create secure policies
        CREATE POLICY "Authenticated users can read conversation analysis"
          ON public.conversation_analysis
          FOR SELECT
          USING (auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can upsert conversation analysis"
          ON public.conversation_analysis
          FOR INSERT
          WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can update conversation analysis"
          ON public.conversation_analysis
          FOR UPDATE
          USING (auth.role() = 'authenticated');
          
        RAISE NOTICE 'Created secure policies for conversation_analysis table';
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Show final state of policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show which tables have RLS enabled
SELECT 
    table_name,
    CASE 
        WHEN relrowsecurity THEN 'RLS Enabled'
        ELSE 'RLS Disabled'
    END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
ORDER BY table_name;
