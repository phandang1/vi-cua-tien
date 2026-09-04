import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Hardcoded public values (safe - these are NEXT_PUBLIC_ vars, not secrets)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gmuqgzhlnvrhbyjaajlu.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXFnemhsbnZyaGJ5amFhamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjUyMjYsImV4cCI6MjEwNDEwMTIyNn0.mkY9iWbJGOAbxEtMLrbJ8u-PbXzQJ4KzPf4GqqPBSP8";

export function createPublicClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
