import type { Listing } from "../../data/listings";
import ListingCard from "./ListingCard";

type Props = {
  title: string;
  listings: Listing[];
};

export default function SectionGrid({ title, listings }: Props) {
  return (
    <section className="px-4">
      <div className="max-w-[1200px] mx-auto">
        <h3 className="text-[13px] text-slate-700 font-medium mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </section>
  );
}


