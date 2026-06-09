import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import { hydrateAuthCookie } from "core";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  message?: string;
};

export function useLogin() {
  return useMutation(
    async (payload: LoginPayload) => {
      const { data } = await client.post<LoginResponse>("auth/login", payload);
      return data;
    },
    {
      onSuccess: async (data) => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        await hydrateAuthCookie();
        toast.success("Connexion réussie.");
      },
      onError: (error: any) => {
        const message: string =
          error?.response?.data?.message ??
          "Email ou mot de passe incorrect. Veuillez réessayer.";
        toast.error(message);
      },
    },
  );
}
