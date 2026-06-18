import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon);

// Server-side (API routes)
export function getServiceClient() {
  return createClient(url, process.env.SUPABASE_SECRET_KEY);
}
