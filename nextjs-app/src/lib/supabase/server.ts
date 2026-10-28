import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function createServerSupabaseClient(): Promise<any> {
  return createServerComponentClient<Database>({
    cookies: () => cookies(),
  }) as any;
}
