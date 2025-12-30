import type { ReactNode } from "react";

interface TripInfoCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
}

export function TripInfoCard({
  icon,
  label,
  value,
  subValue,
}: TripInfoCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
          {value}
        </p>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
      </div>
    </div>
  );
}
