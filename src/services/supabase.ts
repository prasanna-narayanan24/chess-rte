import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lapohodfvhssjcxcxkvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcG9ob2Rmdmhzc2pjeGN4a3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDQ4MTcsImV4cCI6MjA1NjMyMDgxN30.xGbgb7ZC2_JGq0-qYiuXfc9-tp15Y_fMl79JRXmMBZ8';

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
