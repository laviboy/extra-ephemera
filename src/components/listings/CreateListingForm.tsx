import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../stores/useAuth";

type FormState = {
  title: string;
  destination: string;
  price: number | "";
  startDate: string;
  endDate: string;
  guests: number | "";
  description: string;
};

const initialState: FormState = {
  title: "",
  destination: "",
  price: "",
  startDate: "",
  endDate: "",
  guests: "",
  description: "",
};

export default function CreateListingForm() {
  const [state, setState] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth((s) => s.user);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!user) throw new Error("You must be logged in.");
      const rawSession = localStorage.getItem(
        "sb-tomxahjmbfkcrfszuhpo-auth-token"
      );
      const session = rawSession ? JSON.parse(rawSession) : null;
      const accessToken = session?.access_token;

      const res = await fetch("/api/create-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          agentId: user.id,
          title: state.title,
          destination: state.destination,
          description: state.description,
          priceMin: state.price === "" ? null : Number(state.price),
          priceMax: state.price === "" ? null : Number(state.price),
          instantBookable: false,
          status: "draft",
          tags: [],

          // send extra form fields (even though not in DB yet)
          startDate: state.startDate,
          endDate: state.endDate,
          guests: state.guests === "" ? null : Number(state.guests),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");

      setState(initialState);
      alert("Listing created successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={state.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., Cozy city-view apartment"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Destination</label>
          <input
            value={state.destination}
            onChange={(e) => update("destination", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="City, Country"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Price (per night)
          </label>
          <input
            type="number"
            min={0}
            value={state.price}
            onChange={(e) =>
              update(
                "price",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., 250"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Guests</label>
          <input
            type="number"
            min={1}
            value={state.guests}
            onChange={(e) =>
              update(
                "guests",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., 2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start date</label>
          <input
            type="date"
            value={state.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End date</label>
          <input
            type="date"
            value={state.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={state.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={5}
            placeholder="Tell guests about your place..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setState(initialState)}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-rose-500 text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Create listing"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
