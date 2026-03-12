import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

export function createClient() {
  return supabaseCreateClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  );
}
