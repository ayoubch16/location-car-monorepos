import axios from "axios";
import { auth } from "../auth";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API as string,
  headers: { Accept: "application/json" },
});

client.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (error: { response?: { status?: number } }) => {
    if (error.response?.status === 401) {
      auth.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
