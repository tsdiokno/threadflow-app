import { NextResponse } from 'next/server';
import { FLIPSWITCH_PRODUCTION_MODE, SUPABASE_CONFIG } from '@/lib/config/environment';
import { getWorkspaceAdapter } from '@/lib/adapters';

export async function GET() {
  const isProduction = FLIPSWITCH_PRODUCTION_MODE;
  const hasConfig = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);

  const adapter = getWorkspaceAdapter();
  const initResult = await adapter.initialize();

  return NextResponse.json({
    flipswitch: {
      isProductionMode: isProduction,
      hasSupabaseConfig: hasConfig,
      supabaseUrl: SUPABASE_CONFIG.url ? SUPABASE_CONFIG.url.replace(/^https?:\/\//, '').split('.')[0] + '.supabase.co' : null,
    },
    status: initResult.status,
    message: initResult.message,
    details: initResult.details,
    instructions: isProduction && !hasConfig ? [
      '1. Create a Supabase project at https://supabase.com',
      '2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment',
      '3. Run lib/adapters/supabase-schema.sql in the Supabase SQL Editor',
      '4. The automated 5-minute install will bootstrap foundational rooms on initial load'
    ] : undefined
  });
}
