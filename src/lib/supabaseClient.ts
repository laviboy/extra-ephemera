import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Provide these via .env with PUBLIC_ prefix so they are safe for the client
// PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY')
  }
  _client = createClient(url as string, key as string)
  return _client
}
