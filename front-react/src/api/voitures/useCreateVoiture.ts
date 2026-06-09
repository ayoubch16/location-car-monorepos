import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import type { VoiturePayload } from "./types";

export function useCreateVoiture() {
  const qc = useQueryClient();
  return useMutation(
    async (payload: VoiturePayload) => {
      const { data } = await client.post("voitures", payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["voitures"]);
        toast.success("Voiture ajoutée");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la création");
      },
    },
  );
}
