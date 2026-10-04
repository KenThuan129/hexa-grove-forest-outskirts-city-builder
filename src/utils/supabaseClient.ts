// src/utils/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in development — the app is unusable without these.
  // In production this would never trip because the env is set at build time.
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.local.example to .env.local and fill in your project values.'
  );
}

/**
 * The single shared Supabase client.
 *
 * The SDK automatically:
 *  - persists the auth session across page reloads (via localStorage under
 *    the key `sb-<project>-auth-token`)
 *  - rotates the refresh token on each use
 *  - refreshes the access token before expiry
 *  - fires auth state change events we can subscribe to
 *
 * We do NOT override storage here. The auth token is a JWT and is the
 * standard, safe thing to keep in localStorage. Game save state lives
 * elsewhere (Supabase cloud) and never touches the browser.
 */
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // we don't use magic links / OAuth redirects
    storageKey: 'hexa-auth-session',
  },
});