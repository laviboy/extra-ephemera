import { useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import ListingCard from "../ui/ListingCard";
import type { Listing } from "../../lib/api";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Home,
  DollarSign,
  Star,
  Filter,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface FilterState {
  search: string;
  minPrice: string;
  maxPrice: string;
  instantBookable: boolean;
  sortBy: "recent" | "price-low" | "price-high" | "popular";
}

function ExploreContentInner() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    minPrice: "",
    maxPrice: "",
    instantBookable: false,
    sortBy: "recent",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["explore-listings"],
    queryFn: async () => {
      const response = await fetch("/api/listings?limit=100");
      if (!response.ok) throw new Error("Failed to fetch listings");
      const { listings } = await response.json();
      return listings;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesTitle = listing.title.toLowerCase().includes(searchLower);
        const matchesDestination = listing.destination
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDescription = listing.description
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesTitle && !matchesDestination && !matchesDescription) {
          return false;
        }
      }

      // Price filters
      if (filters.minPrice && listing.price_min) {
        if (listing.price_min < parseFloat(filters.minPrice)) return false;
      }
      if (filters.maxPrice && listing.price_max) {
        if (listing.price_max > parseFloat(filters.maxPrice)) return false;
      }

      // Instant bookable filter
      if (filters.instantBookable && !listing.instant_bookable) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return (a.price_min || 0) - (b.price_min || 0);
        case "price-high":
          return (b.price_max || 0) - (a.price_max || 0);
        case "popular":
          // Could add a popularity score later
          return 0;
        case "recent":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  const clearFilters = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      instantBookable: false,
      sortBy: "recent",
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.instantBookable,
  ].filter(Boolean).length;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Search className="h-4 w-4 text-rose-500" />
          Search Destinations
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by location, title..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 border-slate-300 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-rose-500" />
          Price Range
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-600 mb-1.5">Min Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                RM
              </span>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                className="pl-10 border-slate-300 focus:border-rose-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5">Max Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                RM
              </span>
              <Input
                type="number"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                className="pl-10 border-slate-300 focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Booking Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-500" />
          Booking Options
        </Label>
        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={filters.instantBookable}
            onChange={(e) =>
              setFilters({ ...filters, instantBookable: e.target.checked })
            }
            className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-900">
              Instant Book
            </div>
            <div className="text-xs text-slate-600">
              Book without waiting for approval
            </div>
          </div>
        </label>
      </div>

      <Separator />

      {/* Sort By */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-rose-500" />
          Sort By
        </Label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters({
              ...filters,
              sortBy: e.target.value as FilterState["sortBy"],
            })
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-slate-300 hover:bg-slate-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters ({activeFilterCount})
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Explore Amazing Destinations
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Discover unique stays and unforgettable experiences around the
              world
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span>{listings.length} Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Multiple Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Verified Hosts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-rose-500">{activeFilterCount}</Badge>
            )}
            <ChevronDown
              className={`h-4 w-4 ml-auto transition-transform ${
                showMobileFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <Card className="lg:hidden mb-6 border-2 border-slate-200">
            <CardContent className="p-6">
              <FilterSidebar />
            </CardContent>
          </Card>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <Card className="border-2 border-slate-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal className="h-5 w-5 text-rose-500" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Filters
                    </h2>
                  </div>
                  <FilterSidebar />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="lg:col-span-9">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isLoading ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    <>
                      {filteredListings.length}{" "}
                      {filteredListings.length === 1
                        ? "Property"
                        : "Properties"}
                    </>
                  )}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {debouncedSearch &&
                    `Showing results for "${debouncedSearch}"`}
                  {!debouncedSearch && "Browse all available properties"}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredListings.length === 0 && (
              <Card className="border-2 border-dashed border-slate-300">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or search criteria to find more
                    results
                  </p>
                  {activeFilterCount > 0 && (
                    <Button onClick={clearFilters} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Listings Grid */}
            {!isLoading && filteredListings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      subtitle: listing.destination,
                      priceText: listing.price_min
                        ? `RM${listing.price_min} per night`
                        : listing.price_max
                        ? `Up to RM${listing.price_max}`
                        : "Price TBD",
                      imageUrl:
                        listing.first_image_url ||
                        `https://picsum.photos/seed/${encodeURIComponent(
                          listing.id
                        )}/640/480`,
                      isGuestFavorite: false,
                    }}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ExploreContent() {
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
      <ExploreContentInner />
    </QueryClientProvider>
  );
}
