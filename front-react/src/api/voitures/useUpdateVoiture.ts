import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import type { VoiturePayload } from "./types";

export function useUpdateVoiture() {
  const qc = useQueryClient();
  return useMutation(
    async ({ id, ...payload }: VoiturePayload & { id: number }) => {
      const { data } = await client.put(`voitures/${id}`, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["voitures"]);
        toast.success("Voiture mise à jour");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la modification");
      },
    },
  );
}
