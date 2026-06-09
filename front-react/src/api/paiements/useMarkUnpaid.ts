import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function useMarkUnpaid() {
  const qc = useQueryClient();
  return useMutation(
    async (id: number) => {
      const { data } = await client.post(`paiements/${id}/mark-unpaid`);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["paiements"]);
        qc.invalidateQueries(["locations"]);
        toast.success("Location marquée comme non payée");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la mise à jour");
      },
    },
  );
}
