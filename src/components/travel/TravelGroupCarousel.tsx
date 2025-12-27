import type { TravelGroup } from "../../data/travelGroups";
import TravelGroupCard from "./TravelGroupCard";

type Props = {
  title: string;
  groups: TravelGroup[];
};

export default function TravelGroupCarousel({ title, groups }: Props) {
  return (
    <section className="py-4">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="m-0 mb-3 text-[20px]">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-4 pb-1 max-w-[1200px] mx-auto">
          {groups.map((g) => (
            <TravelGroupCard key={g.id} group={g} />
          ))}
        </div>
      </div>
    </section>
  );
}


