import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPass = process.env.ADMIN_PASSWORD;

  return NextResponse.json({
    has_url: !!url,
    url_prefix: url ? url.substring(0, 30) : null,
    has_anon_key: !!anonKey,
    anon_key_prefix: anonKey ? anonKey.substring(0, 20) : null,
    has_service_key: !!serviceKey,
    service_key_prefix: serviceKey ? serviceKey.substring(0, 20) : null,
    has_admin_password: !!adminPass,
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
