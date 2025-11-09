import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Directly include the Supabase URL and anon key as fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyklshcuvoedvqhvyhry.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a2xzaGN1dm9lZHZxaHZ5aHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjQ0MzUsImV4cCI6MjA3ODIwMDQzNX0.HtFtq1MjzdCgH-6lbMesONdtCK1bdq_tkzAqy7z6CFQ';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

