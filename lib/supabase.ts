import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are not configured");
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

