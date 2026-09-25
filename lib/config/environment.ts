/**
 * ThreadFlow Flipswitch Configuration
 * 
 * A single environment variable / boolean constant that toggles the application
 * between Development Mode (in-memory JSON mock dummy data + simulated websockets)
 * and Production Mode (live Supabase PostgreSQL database + Realtime WebSockets + Storage).
 * 
 * Developer instructions:
 * - Toggle `FLIPSWITCH_PRODUCTION_MODE = true` in code below OR set
 *   `NEXT_PUBLIC_ENABLE_PRODUCTION_MODE=true` in your .env or Vercel Environment Variables.
 * - In Production Mode: The app activates the automated WordPress-style 5-minute install
 *   flow on first run, bootstrapping tables, realtime replication, and seeding foundational rooms.
 * - In Dev Mode: The app instantly reverts to JSON mock dummy data with zero external dependencies.
 */

// Developer-level explicit code override (can be set to true/false directly here):
const CODE_LEVEL_PRODUCTION_OVERRIDE: boolean = false;

// Universal Production Flag (reads environment variable or code override)
export const FLIPSWITCH_PRODUCTION_MODE: boolean =
  CODE_LEVEL_PRODUCTION_OVERRIDE ||
  (process.env.NEXT_PUBLIC_ENABLE_PRODUCTION_MODE === 'true');

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  storageBucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'workspace-assets',
};

/**
 * Returns environment runtime diagnostic metadata
 */
export function getEnvironmentInfo() {
  const isProd = FLIPSWITCH_PRODUCTION_MODE;
  return {
    isProduction: isProd,
    modeLabel: isProd ? 'Production (Supabase + Realtime)' : 'Development (Mock Dummy Data)',
    hasSupabaseCredentials: Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey),
    supabaseUrl: SUPABASE_CONFIG.url ? SUPABASE_CONFIG.url.replace(/^https?:\/\//, '').split('.')[0] + '.supabase.co' : 'Not configured',
  };
}
