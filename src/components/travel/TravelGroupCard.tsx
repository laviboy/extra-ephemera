import type { TravelGroup } from "../../data/travelGroups";
import { motion } from "framer-motion";

type Props = {
  group: TravelGroup;
};

export default function TravelGroupCard({ group }: Props) {
  return (
    <motion.a
      href={`/travel/${group.slug}`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="block w-[280px] shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow"
    >
      <div className="w-full aspect-[4/3] bg-slate-100">
        <img
          src={group.coverUrl}
          alt={group.title}
          className="w-full h-full object-cover block"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="m-0 text-[16px] leading-tight">{group.title}</h3>
        <p className="m-0 mt-1 text-slate-600 text-[13px]">
          {group.destination}
        </p>
        <p className="m-0 mt-1 text-slate-500 text-[12px]">
          {new Date(group.startDate).toLocaleDateString()} –{" "}
          {new Date(group.endDate).toLocaleDateString()}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">${group.priceUsd}</span>
          <span
            className={
              group.seatsLeft <= 3
                ? "text-red-600 text-[12px]"
                : "text-green-600 text-[12px]"
            }
          >
            {group.seatsLeft} left
          </span>
        </div>
      </div>
    </motion.a>
  );
}
