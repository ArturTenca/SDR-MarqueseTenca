// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration - using environment variables with fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://stgxtrblbyjnmliegsvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Z3h0cmJsYnlqbm1saWVnc3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTU1NjMsImV4cCI6MjA3ODE5MTU2M30.gFjMtyBU3o_yaSri9PE-bbR_zUkHANHDn7Bkak7fZuQ';

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