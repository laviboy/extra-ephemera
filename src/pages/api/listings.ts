import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Listing {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  instant_bookable: boolean;
  created_at: string;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 12;
    
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return Response.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return Response.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
};
