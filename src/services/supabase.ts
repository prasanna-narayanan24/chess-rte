import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (window as any)?.configs?.VITE_SUPABASE_BASE_URL || import.meta.env.VITE_SUPABASE_BASE_URL;
const SUPABASE_ANON_KEY = (window as any)?.configs?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;


console.log('SUPABASE_URL :>> ', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signInAnonymously(name?: string) {
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: { display_name: name ??'Anonymous' }
    }
  });
  if (error) throw error;
  return data.user;  // gives you user.id
}

export async function getUserInfo(userId: string) {
  const { data, error } = await supabase.from('auth.users').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}
