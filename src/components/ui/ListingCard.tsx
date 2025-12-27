import type { Listing } from "../../data/listings";

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  return (
    <a href={`/listing/${listing.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="aspect-[4/3] bg-slate-100">
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
        {/* Heart icon */}
        <button aria-label="Save" className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-sm hover:bg-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.099 3.75 3 5.765 3 8.25c0 7.22 8.25 11.25 8.25 11.25S21 15.47 21 8.25Z"/>
          </svg>
        </button>
        {/* Badge */}
        {listing.isGuestFavorite && (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-800 shadow">Guest favourite</span>
        )}
      </div>
      <div className="mt-2">
        <p className="m-0 text-[13px] text-slate-900 line-clamp-1">{listing.title}</p>
        <p className="m-0 mt-1 text-[12px] text-slate-600 line-clamp-1">{listing.subtitle}</p>
        <p className="m-0 mt-1 text-[12px] text-slate-700">{listing.priceText}</p>
      </div>
    </a>
  );
}


