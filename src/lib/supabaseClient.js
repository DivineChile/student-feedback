import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let client = null;

export function createClient() {
  if (!client) {
    client = createSupabaseClient(supabaseUrl, supabaseKey);
  }
  return client;
}
