import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import type { UserPayload } from "./types";

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation(
    async (payload: UserPayload) => {
      const { data } = await client.post("users", payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["users"]);
        toast.success("Utilisateur créé");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la création");
      },
    },
  );
}
