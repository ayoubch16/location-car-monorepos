import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import type { LocationStatut } from "./types";

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation(
    async ({ id, statut }: { id: number; statut: LocationStatut }) => {
      const { data } = await client.put(`locations/${id}`, { statut });
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["locations"]);
        toast.success("Statut mis à jour");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur");
      },
    },
  );
}
