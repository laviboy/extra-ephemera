import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSupabase } from "../../lib/supabaseClient";
import { useAuth, type AuthUser } from "../../stores/useAuth";

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Modern gradient background for avatar
const gradients = [
  "from-violet-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-pink-500",
  "from-rose-500 to-pink-500",
];

function getGradientFromEmail(email: string): string {
  const hash = email
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
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

  const initials = (user?.name || user?.email || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const gradient = user ? getGradientFromEmail(user.email) : gradients[0];

  async function handleSignOut() {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {}
    setMenuOpen(false);
    window.location.href = "/";
  }

  if (user) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="group flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-3 py-1.5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:bg-white active:scale-95"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {/* User info - hidden on mobile */}
          <div className="hidden md:flex flex-col text-right leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              {user.name || user.email?.split("@")[0]}
            </span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>

          {/* Avatar with gradient */}
          <div className="relative">
            <div
              title={user.email}
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-white transition-transform group-hover:scale-105`}
            >
              {initials}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          </div>

          {/* Chevron icon with animation */}
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              menuOpen ? "rotate-180" : ""
            }`}
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

        {/* Dropdown Menu with animation */}
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-3 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-base shadow-lg`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <a
                href="/profile"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200 transition-colors">
                  <svg
                    className="h-4 w-4"
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
                </div>
                <div className="flex-1">
                  <div className="font-medium">Profile</div>
                  <div className="text-xs text-slate-500">
                    View your profile
                  </div>
                </div>
              </a>

              <a
                href="/settings"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="h-4 w-4"
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
                </div>
                <div className="flex-1">
                  <div className="font-medium">Settings</div>
                  <div className="text-xs text-slate-500">
                    Manage preferences
                  </div>
                </div>
              </a>
            </div>

            {/* Divider */}
            <div className="my-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Sign Out */}
            <div className="p-2">
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
                  <svg
                    className="h-4 w-4"
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
                </div>
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative h-10 px-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95"
      >
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Log in
        </span>
      </button>
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const setUser = useAuth((s) => s.setUser);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

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

          // Sync to your DB on login as well
          try {
            const response = await fetch("/api/upsert-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: u.id,
                email: u.email ?? email,
                name,
                emailVerified: u.email_confirmed_at ?? null,
              }),
            });

            if (!response.ok) {
              console.error("Failed to sync user on login");
            }
          } catch (dbError) {
            console.error("Database sync error on login:", dbError);
          }

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
          try {
            const response = await fetch("/api/upsert-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: u.id,
                email: u.email ?? email,
                name,
                emailVerified: u.email_confirmed_at ?? null,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error("Failed to sync user to database:", errorData);
              throw new Error(errorData.error || "Failed to sync user");
            }

            const result = await response.json();
            console.log("User synced to database:", result);
          } catch (dbError: any) {
            console.error("Database sync error:", dbError);
            // Don't throw - allow signup to complete even if DB sync fails
            setMessage("Account created! Please log in.");
          }

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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[10000] w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 px-6 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:rotate-90 active:scale-90"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative">
            <div className="mb-2 inline-flex rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
              {mode === "login" ? "Welcome back" : "Get started"}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === "login"
                ? "Login to your account"
                : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {mode === "login"
                ? "Enter your credentials to continue"
                : "Start your journey with us today"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mode Toggle */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 text-sm">
            <button
              type="button"
              className={classNames(
                "flex-1 rounded-lg py-2.5 font-medium transition-all duration-200",
                mode === "login"
                  ? "bg-white shadow-md text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              )}
              onClick={() => {
                setMode("login");
                setError(null);
                setMessage(null);
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={classNames(
                "flex-1 rounded-lg py-2.5 font-medium transition-all duration-200",
                mode === "signup"
                  ? "bg-white shadow-md text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              )}
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
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
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 text-red-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 text-emerald-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-emerald-800">{message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
              <span className={loading ? "invisible" : ""}>
                {mode === "login" ? "Login" : "Create account"}
              </span>
            </button>
          </form>

          {/* Footer */}
          {mode === "login" && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Protected by reCAPTCHA and subject to our{" "}
              <a
                href="#"
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
