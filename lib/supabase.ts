import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    // Try runtime env vars first (for server-side), fallback to NEXT_PUBLIC_ (for build-time baked)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase environment variables are not configured");
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// Type for marketing leads
export interface MarketingLead {
  id?: string;
  created_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  practice_name?: string;
  practice_size?: string;
  current_emr?: string;
  inquiry_type?: string;
  message?: string;
  source?: string;
}

