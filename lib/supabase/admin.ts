import { createClient } from "@supabase/supabase-js";

// Hardcoded public URL (safe - NEXT_PUBLIC_ var)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gmuqgzhlnvrhbyjaajlu.supabase.co";
// Service role key - try env var first, fallback to hardcoded for Vercel deployment issues
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXFnemhsbnZyaGJ5amFhamx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyNTIyNiwiZXhwIjoyMTA0MTAxMjI2fQ.BAc9rsoOiYzbePv2bpIT5mLNxETwDPb7BBlItA05oJY";

export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
