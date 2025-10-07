import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not set. Please check your .env file.');
  console.error('Available env vars:', import.meta.env);
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
