import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { refreshAuthLogicCookie } from "./refreshCookie";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  // Skip attaching the (potentially expired) token to the refresh request itself
  // to avoid a 401 loop where refresh also gets rejected.
  if (token && !config.url?.includes("auth/refresh")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

createAuthRefreshInterceptor(client, refreshAuthLogicCookie, {
  statusCodes: [401],
});
