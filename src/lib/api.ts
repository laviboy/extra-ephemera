export interface Listing {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  priceText: string;
  imageUrl: string;
  first_image_url?: string | null;
  isGuestFavorite: boolean;
  instant_bookable: boolean;
  created_at: string;
}

export async function fetchListings(limit: number = 12): Promise<Listing[]> {
  try {
    const response = await fetch(`/api/listings?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }
    const { listings } = await response.json();
    return listings;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}
