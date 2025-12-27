import { useEffect, useRef, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { useAuth, type AuthUser } from "../../stores/useAuth";

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AuthButton() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const clearUser = useAuth((s) => s.clearUser);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const supabase = getSupabase();
      // Load initial session
      supabase.auth.getUser().then(({ data }) => {
        const u = data.user;
        if (u) {
          const authUser: AuthUser = {
            id: u.id,
            email: u.email ?? "",
            name: (u.user_metadata as any)?.full_name ?? u.email ?? null,
          };
          setUser(authUser);
        }
      });

      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const u = session?.user;
          if (u) {
            setUser({
              id: u.id,
              email: u.email ?? "",
              name: (u.user_metadata as any)?.full_name ?? u.email ?? null,
            });
          } else {
            clearUser();
          }
        }
      );
      unsub = () => sub.subscription.unsubscribe();
    } catch (e) {
      // Supabase not configured; leave user as null and render a disabled button
    }

    return () => {
      if (unsub) unsub();
    };
  }, [setUser, clearUser]);

  // Close dropdown on outside click / ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const initials = (user?.name || user?.email || "").slice(0, 1).toUpperCase();

  async function handleSignOut() {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {}
    setMenuOpen(false);
  }

  if (user) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border px-2 py-1.5 hover:bg-slate-50"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="hidden md:flex flex-col text-right leading-tight">
            <span className="text-sm font-medium text-slate-900">
              {user.name || user.email}
            </span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
          <div
            title={user.email}
            className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-semibold"
          >
            {initials}
          </div>
          <svg
            className="ml-1 h-4 w-4 text-slate-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border bg-white p-1 text-sm shadow-lg ring-1 ring-black/5"
          >
            <div className="px-3 py-2 text-slate-500">
              Signed in as
              <div className="truncate font-medium text-slate-900">
                {user.email}
              </div>
            </div>
            <div className="my-1 h-px bg-slate-100" />
            <a
              href="/profile"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profile</span>
            </a>
            <a
              href="/settings"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </a>
            <div className="my-1 h-px bg-slate-100" />
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50"
      >
        Log in
      </button>
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const setUser = useAuth((s) => s.setUser);
  const [mode, setMode] = useState<"login" | "signup">("login");
  let supabase: ReturnType<typeof getSupabase> | null = null;
  try {
    supabase = getSupabase();
  } catch {
    supabase = null;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (!supabase) {
        setError(
          "Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const u = data.user;
        if (u) {
          const name = (u.user_metadata as any)?.full_name ?? u.email ?? null;
          setUser({ id: u.id, email: u.email ?? email, name });
          // Try to upsert into our public users table (schema adapted for Supabase)
          try {
            await supabase
              .from("users")
              .upsert(
                { id: u.id, email: u.email ?? email, name },
                { onConflict: "id" }
              );
          } catch {}
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || null } },
        });
        if (error) throw error;
        const u = data.user;
        if (u) {
          const name =
            (u.user_metadata as any)?.full_name ??
            (fullName || u.email || null);
          setUser({ id: u.id, email: u.email ?? email, name });

          // ✅ Sync to your DB
          await fetch("/api/upsert-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: u.id,
              email: u.email,
              name,
              emailVerified: u.email_confirmed_at ?? null,
            }),
          });
          onClose();
        } else {
          setMessage("Check your email to confirm your sign up.");
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "login"
              ? "Log in to your account"
              : "Create your account"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="mb-4 flex rounded-full bg-slate-100 p-1 text-sm">
          <button
            className={classNames(
              "flex-1 rounded-full py-1.5",
              mode === "login"
                ? "bg-white shadow text-slate-900"
                : "text-slate-500"
            )}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={classNames(
              "flex-1 rounded-full py-1.5",
              mode === "signup"
                ? "bg-white shadow text-slate-900"
                : "text-slate-500"
            )}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Log in"
              : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
