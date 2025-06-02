import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!supabaseUrl.startsWith('https://')) {
  console.error('Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('VITE_SUPABASE_URL must start with https://');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'thfc-scanner-auth',
    storage: window.localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'thfc_scanner'
    }
  }
});

// Test the connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
}); 