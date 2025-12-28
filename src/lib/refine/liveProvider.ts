import { liveProvider } from "@refinedev/supabase";
import { getSupabase } from "../supabaseClient";

/**
 * Refine live provider for real-time updates via Supabase Realtime
 * Automatically syncs data changes across all connected clients
 */
export const supabaseLiveProvider = liveProvider(getSupabase());
