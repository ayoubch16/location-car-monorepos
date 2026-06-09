import type { User } from "./types";

const TOKEN_KEY = "lc_token";
const USER_KEY  = "lc_user";

export const auth = {
  getToken:    ()          => localStorage.getItem(TOKEN_KEY),
  setToken:    (t: string) => localStorage.setItem(TOKEN_KEY, t),
  removeToken: ()          => localStorage.removeItem(TOKEN_KEY),

  getUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
    } catch {
      return null;
    }
  },
  setUser:    (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  removeUser: ()        => localStorage.removeItem(USER_KEY),

  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
