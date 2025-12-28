import { dataProvider } from "@refinedev/supabase";
import { getSupabase } from "../supabaseClient";

/**
 * Refine data provider for Supabase
 * Handles all CRUD operations for CRM resources
 */
export const supabaseDataProvider = dataProvider(getSupabase());
