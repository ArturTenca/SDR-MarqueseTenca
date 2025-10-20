// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration - using environment variables with fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://duozwnqpxxgtzngedgyx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b3p3bnFweHhndHpuZ2VkZ3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjQxMTYsImV4cCI6MjA3NjMwMDExNn0.8ib0XlLKVHu5oq3oCCDJsxSbqAD4i2hHhxij7Dw__Yg';

// Debug: Check if environment variables are loaded
console.log('Environment check:', {
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
  finalUrl: SUPABASE_URL,
  finalKey: SUPABASE_PUBLISHABLE_KEY ? 'Present' : 'Missing'
});

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});