import { FLIPSWITCH_PRODUCTION_MODE } from '@/lib/config/environment';
import { ChatDataAdapter } from '@/types/adapters';
import { MockChatAdapter } from './mock-adapter';
import { SupabaseChatAdapter } from './supabase-adapter';

let cachedAdapter: ChatDataAdapter | null = null;
let cachedMode: boolean | null = null;

/**
 * Returns the singleton workspace data adapter based on the Flipswitch.
 * - When FLIPSWITCH_PRODUCTION_MODE is true: returns SupabaseChatAdapter with real WebSockets & automated setup.
 * - When FLIPSWITCH_PRODUCTION_MODE is false: returns MockChatAdapter with local dummy data & simulated events.
 */
export function getWorkspaceAdapter(): ChatDataAdapter {
  if (cachedAdapter && cachedMode === FLIPSWITCH_PRODUCTION_MODE) {
    return cachedAdapter;
  }

  cachedMode = FLIPSWITCH_PRODUCTION_MODE;
  if (FLIPSWITCH_PRODUCTION_MODE) {
    cachedAdapter = new SupabaseChatAdapter();
  } else {
    cachedAdapter = new MockChatAdapter();
  }

  return cachedAdapter;
}

export { MockChatAdapter, SupabaseChatAdapter };
