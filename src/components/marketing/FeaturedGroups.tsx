import type { TravelGroup } from "../../data/travelGroups";
import TravelGroupCard from "../travel/TravelGroupCard";

type Props = {
  title: string;
  groups: TravelGroup[];
  id?: string;
};

export default function FeaturedGroups({ title, groups, id }: Props) {
  return (
    <section id={id} className="px-4 py-8 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-slate-500">Explore our featured listings</p>
            <h2 className="text-[22px] font-semibold">{title}</h2>
          </div>
          <a href="#" className="text-sm text-slate-700 underline">View all</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {groups.slice(0, 8).map((g) => (
            <TravelGroupCard key={g.id} group={g} />
          ))}
        </div>
      </div>
    </section>
  );
}


