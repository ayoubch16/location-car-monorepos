import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function useDeleteVoiture() {
  const qc = useQueryClient();
  return useMutation(
    async (id: number) => {
      await client.delete(`voitures/${id}`);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["voitures"]);
        toast.success("Voiture supprimée");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la suppression");
      },
    },
  );
}
