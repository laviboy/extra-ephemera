// src/components/marketing/FreshListings.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useListings } from "../../hooks/useListings";
import ListingCard from "../ui/ListingCard";
import type { Listing as ListingType } from "../../lib/api";

type Props = {
  title: string;
};

function FreshListingsContent({ title }: Props) {
  const initialData =
    typeof window !== "undefined"
      ? (window as any).__INITIAL_LISTINGS__
      : undefined;

  const { data: listings = [], isLoading, error } = useListings(initialData);

  if (isLoading && !initialData) {
    return (
      <section className="px-4 py-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-8">
        <div className="max-w-[1200px] mx-auto text-center py-8">
          <p className="text-red-500">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-slate-500">
              Fresh on the market
            </p>
            <h2 className="text-[22px] font-semibold">{title}</h2>
          </div>
          <a href="/listings" className="text-sm text-slate-700 underline">
            See more
          </a>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  ...listing,
                  priceText: listing.price_min
                    ? `RM${listing.price_min} per night`
                    : listing.price_max
                    ? `Up to RM${listing.price_max}`
                    : "Price TBD",
                  imageUrl: `https://picsum.photos/seed/${encodeURIComponent(
                    listing.id
                  )}/640/480`,
                  isGuestFavorite: false,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No listings found. Be the first to create one!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function FreshListings({ title }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FreshListingsContent title={title} />
    </QueryClientProvider>
  );
}
