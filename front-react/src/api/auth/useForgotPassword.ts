import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import { hydrateAuthCookie } from "core";

type ForgotResponse = {
  access_token?: string;
  refresh_token?: string;
  message?: string;
  token?: string;
  reset_token?: string;
};

export function useForgotPassword() {
  return useMutation(
    async (email: string) => {
      const { data } = await client.post<ForgotResponse>("auth/forgot-password", { email });
      return data;
    },
    {
      onSuccess: async (data) => {
        if (data?.access_token) {
          localStorage.setItem("access_token", data.access_token);
          if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
          toast.success(data.message ?? "Connexion réussie.");
          await hydrateAuthCookie();
        } else {
          toast.success(data?.message ?? "Email de réinitialisation envoyé.");
        }
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ?? "Aucun compte associé à cet email.",
        );
      },
    },
  );
}
