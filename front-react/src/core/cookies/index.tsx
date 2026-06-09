import { create } from "zustand";
import { client } from "api/client";

export type AuthUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  num_permis?: string | null;
  date_naissance?: string | null;
  role: "client" | "admin";
};

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "signOut" | "signIn";
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  hydrate: () => void;
}

export const useAuthCookie = create<AuthState>((set, get) => ({
  status: "idle",
  user: null,

  signIn: (user: AuthUser) => set({ status: "signIn", user }),

  signOut: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ status: "signOut", user: null });
  },

  hydrate: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ status: "signOut", user: null });
      return;
    }
    try {
      const { data } = await client.get("auth/me", { timeout: 5000 });
      // API may wrap: { user: { ... } } or { data: { ... } }
      const user = (data?.user ?? data?.data ?? data) as AuthUser;
      get().signIn(user);
    } catch {
      // Token invalid, expired, or backend unreachable — clear and send to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({ status: "signOut", user: null });
    }
  },
}));

export const signInCookie = (user: AuthUser) =>
  useAuthCookie.getState().signIn(user);
export const signOutCookie = () => useAuthCookie.getState().signOut();
export const hydrateAuthCookie = () => useAuthCookie.getState().hydrate();
