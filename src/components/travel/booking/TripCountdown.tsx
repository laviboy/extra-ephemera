import { Clock } from "lucide-react";

interface TripCountdownProps {
  startDate: Date;
}

export function TripCountdown({ startDate }: TripCountdownProps) {
  const now = new Date();
  const diffTime = startDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (isNaN(diffDays)) {
    return null;
  }

  if (diffDays < 0) {
    return (
      <div className="text-center p-4 bg-slate-100 rounded-xl">
        <p className="text-sm text-slate-600">Trip has started</p>
      </div>
    );
  }

  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  return (
    <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-4 sm:p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5" />
        <span className="font-medium text-sm">Trip Countdown</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl sm:text-5xl font-bold">{diffDays}</span>
        <span className="text-lg opacity-90">days to go</span>
      </div>
      {weeks > 0 && (
        <p className="text-sm opacity-80 mt-1">
          That's {weeks} week{weeks > 1 ? "s" : ""}{" "}
          {days > 0 ? `and ${days} day${days > 1 ? "s" : ""}` : ""}
        </p>
      )}
      <p className="text-xs opacity-70 mt-2">
        Departure:{" "}
        {startDate.toLocaleDateString("en-MY", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
