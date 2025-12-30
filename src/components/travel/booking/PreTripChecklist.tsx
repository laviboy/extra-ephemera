import { useState } from "react";

interface PreTripChecklistProps {
  tripDate: Date;
}

const checklistItems = [
  { id: "passport", label: "Valid passport (6+ months validity)", icon: "🛂" },
  { id: "visa", label: "Visa requirements checked", icon: "📋" },
  { id: "insurance", label: "Travel insurance", icon: "🛡️" },
  { id: "vaccinations", label: "Vaccinations up to date", icon: "💉" },
  { id: "packing", label: "Packing list prepared", icon: "🧳" },
  { id: "currency", label: "Local currency/card ready", icon: "💳" },
  { id: "documents", label: "Booking confirmations saved", icon: "📄" },
  { id: "contacts", label: "Emergency contacts noted", icon: "📞" },
];

export function PreTripChecklist({ tripDate }: PreTripChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("trip-checklist");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const toggleItem = (id: string) => {
    const newChecked = checkedItems.includes(id)
      ? checkedItems.filter((item) => item !== id)
      : [...checkedItems, id];
    setCheckedItems(newChecked);
    try {
      localStorage.setItem("trip-checklist", JSON.stringify(newChecked));
    } catch {
      // Ignore localStorage errors
    }
  };

  const progress = (checkedItems.length / checklistItems.length) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {checkedItems.length}/{checklistItems.length} completed
        </span>
        <span className="text-xs font-medium text-emerald-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {checklistItems.map((item) => (
          <label
            key={item.id}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              checkedItems.includes(item.id)
                ? "bg-emerald-50"
                : "hover:bg-slate-50"
            }`}
          >
            <input
              type="checkbox"
              checked={checkedItems.includes(item.id)}
              onChange={() => toggleItem(item.id)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm">{item.icon}</span>
            <span
              className={`text-xs sm:text-sm ${
                checkedItems.includes(item.id)
                  ? "text-slate-500 line-through"
                  : "text-slate-700"
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
