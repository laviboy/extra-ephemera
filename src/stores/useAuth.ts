import { create } from "zustand";

export type UserRole = "traveler" | "agent" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: UserRole | null;
};

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
