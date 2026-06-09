import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function useCancelLocation() {
  const qc = useQueryClient();
  return useMutation(
    async (id: number) => {
      const { data } = await client.post(`locations/${id}/cancel`);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["locations"]);
        toast.success("Location annulée");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de l'annulation");
      },
    },
  );
}
