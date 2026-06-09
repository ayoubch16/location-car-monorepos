import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import type { UserPayload } from "./types";

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation(
    async ({ id, ...payload }: UserPayload & { id: number }) => {
      const { data } = await client.put(`users/${id}`, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["users"]);
        toast.success("Utilisateur mis à jour");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la modification");
      },
    },
  );
}
