import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation(
    async (id: number) => {
      await client.delete(`locations/${id}`);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["locations"]);
        toast.success("Location supprimée");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la suppression");
      },
    },
  );
}
