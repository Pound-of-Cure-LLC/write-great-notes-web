import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Determine environment from URL to set appropriate cookie name
  const isDevelopment = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('bqnmswezadsxxfbpugua');
  const cookiePrefix = isDevelopment ? 'dev' : 'prod';

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: `${cookiePrefix}-sb`,
      },
    }
  );
}
