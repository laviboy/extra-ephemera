import { useAuth } from "../../stores/useAuth";

interface Traveler {
  id: string;
  name: string;
  email?: string;
  confirmedAt?: string;
}

interface TravelCompanionsProps {
  travelers: Traveler[];
  maxGroupSize: number;
  availableSpots: number;
}

export function TravelCompanions({
  travelers,
  maxGroupSize,
  availableSpots,
}: TravelCompanionsProps) {
  const confirmedCount = travelers.length;
  const user = useAuth((s) => s.user);

  // Generate initials from name or email
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate a consistent color based on the user id
  const getAvatarColor = (id: string) => {
    const colors = [
      "from-rose-400 to-pink-600",
      "from-blue-400 to-indigo-600",
      "from-green-400 to-emerald-600",
      "from-purple-400 to-violet-600",
      "from-orange-400 to-red-600",
      "from-teal-400 to-cyan-600",
      "from-amber-400 to-yellow-600",
      "from-fuchsia-400 to-pink-600",
    ];
    const index =
      id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Meet Your Travel Companions
      </h2>
      <p className="text-slate-600 mb-6">
        {travelers.length > 0
          ? `${travelers.length} traveler${
              travelers.length !== 1 ? "s" : ""
            } confirmed for this trip`
          : "Be the first to join this adventure!"}
      </p>

      {travelers.length > 0 ? (
        <div className="flex flex-wrap gap-4 mb-6">
          {travelers.map((traveler) => {
            const isCurrentUser = user && traveler.id === user.id;
            return (
              <a
                key={traveler.id}
                href={`/profile/${traveler.id}`}
                className={`flex items-center gap-3 border border-slate-200 rounded-xl p-3 hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group ${
                  isCurrentUser ? "ring-2 ring-rose-400" : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(
                    traveler.id
                  )} flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform`}
                >
                  {getInitials(traveler.name)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-rose-600 transition-colors flex items-center gap-2">
                    {traveler.name}
                    {isCurrentUser && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl w-full">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-slate-600">
              No travelers have confirmed yet. Be the first to join!
            </p>
          </div>
        </div>
      )}

      <div
        className={`${
          availableSpots > 0 && availableSpots <= 5
            ? "bg-rose-50 border-rose-200"
            : "bg-slate-50 border-slate-200"
        } border rounded-xl p-4`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 ${
              availableSpots > 0 && availableSpots <= 5
                ? "bg-rose-500"
                : "bg-slate-500"
            } rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white font-bold text-lg">
              {availableSpots}
            </span>
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {availableSpots > 0
                ? availableSpots <= 5
                  ? `Only ${availableSpots} spot${
                      availableSpots !== 1 ? "s" : ""
                    } remaining!`
                  : `${availableSpots} spot${
                      availableSpots !== 1 ? "s" : ""
                    } available`
                : "Trip is fully booked!"}
            </div>
            <div className="text-sm text-slate-600">
              {availableSpots > 0 ? (
                confirmedCount > 0 ? (
                  <>
                    {confirmedCount} of {maxGroupSize} spots filled.{" "}
                    {availableSpots <= 5
                      ? "Reserve your spot today."
                      : "Join the adventure!"}
                  </>
                ) : (
                  "Be the first to reserve your spot on this trip."
                )
              ) : (
                "Join the waitlist to be notified if a spot opens up."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
