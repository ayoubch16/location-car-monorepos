import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import type { AuthUser } from "core/cookies";
import { signInCookie } from "core/cookies";

export type ProfilePayload = {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  num_permis?: string;
  date_naissance?: string;
  password?: string;
  password_confirmation?: string;
};

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation(
    async (payload: ProfilePayload) => {
      const { data } = await client.put("auth/profile", payload);
      return (data?.user ?? data?.data ?? data) as AuthUser;
    },
    {
      onSuccess: (data) => {
        signInCookie(data);
        qc.setQueryData(["profile"], data);
        qc.invalidateQueries(["profile"]);
        toast.success("Profil mis à jour.");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la mise à jour.");
      },
    },
  );
}
