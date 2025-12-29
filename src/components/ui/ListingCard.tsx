import type { Listing } from "../../data/listings";
import { Heart, Star, MapPin, Users } from "lucide-react";
import { useState } from "react";

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <a href={`/travel/${listing.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20"></div>

          {/* Heart icon */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsSaved(!isSaved);
            }}
            aria-label="Save"
            className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm p-2 text-slate-700 hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isSaved ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Badge */}
          {listing.isGuestFavorite && (
            <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" />
              Guest Favourite
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 text-base line-clamp-1 flex-1 group-hover:text-rose-600 transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 bg-slate-100 px-2 py-1 rounded-lg">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-slate-900">4.9</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-600 mb-3">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm line-clamp-1">{listing.subtitle}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-3"></div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {listing.priceText}
              </p>
              <p className="text-xs text-slate-500">per person</p>
            </div>
            <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-sm font-semibold group-hover:bg-rose-500 group-hover:text-white transition-colors">
              Book Now
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
