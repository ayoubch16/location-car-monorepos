import { client } from "../client";
import { signOutCookie } from "core";

export const refreshAuthLogicCookie = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    const { data } = await client.post<{ access_token: string; refresh_token?: string }>(
      "auth/refresh",
      { refresh_token: refreshToken },
    );
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  } catch {
    signOutCookie();
    return Promise.reject(new Error("Session expirée. Veuillez vous reconnecter."));
  }
};
