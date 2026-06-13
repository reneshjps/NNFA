import { createClient } from '@supabase/supabase-js';

const normalizeEnvValue = (value) =>
  typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : value;

const rawUrl = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL);
const rawKey = normalizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

const isValidHttpUrl = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured =
  rawUrl &&
  rawKey &&
  rawUrl !== 'your_supabase_url_here' &&
  rawKey !== 'your_supabase_anon_key_here' &&
  !rawUrl.includes('placeholder') &&
  isValidHttpUrl(rawUrl);

export const supabase = isSupabaseConfigured
  ? createClient(
    rawUrl,
    rawKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  )
  : null;
