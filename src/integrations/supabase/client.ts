// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration - using direct credentials
const SUPABASE_URL = 'https://duozwnqpxxgtzngedgyx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b3p3bnFweHhndHpuZ2VkZ3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjQxMTYsImV4cCI6MjA3NjMwMDExNn0.8ib0XlLKVHu5oq3oCCDJsxSbqAD4i2hHhxij7Dw__Yg';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});