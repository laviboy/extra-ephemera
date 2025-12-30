import { useState, useEffect } from "react";

interface SpotsAlertProps {
  listingId: string;
  initialAvailableSpots: number;
}

export function SpotsAlert({
  listingId,
  initialAvailableSpots,
}: SpotsAlertProps) {
  const [availableSpots, setAvailableSpots] = useState(initialAvailableSpots);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableSpots();
  }, [listingId]);

  const fetchAvailableSpots = async () => {
    try {
      const response = await fetch(
        `/api/travel-bookings/travelers/${listingId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSpots(data.availableSpots ?? initialAvailableSpots);
      }
    } catch (error) {
      console.error("Error fetching available spots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-slate-200 rounded flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Don't show the alert if there are plenty of spots
  if (availableSpots > 5) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="font-bold text-green-900 text-sm">
              {availableSpots} spots available
            </div>
            <div className="text-xs text-green-700 mt-1">
              Reserve your spot to join this adventure.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show urgent alert for low spots
  if (availableSpots > 0) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <div className="font-bold text-red-900 text-sm">
              Only {availableSpots} spot{availableSpots !== 1 ? "s" : ""} left!
            </div>
            <div className="text-xs text-red-700 mt-1">
              This trip is almost full. Book now to secure your spot.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show fully booked message
  return (
    <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-xl">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <div>
          <div className="font-bold text-slate-900 text-sm">
            Trip is fully booked
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Join the waitlist to be notified if a spot opens up.
          </div>
        </div>
      </div>
    </div>
  );
}
