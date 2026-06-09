import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function usePayPaiement() {
  const qc = useQueryClient();
  return useMutation(
    async ({ id, methode }: { id: number; methode: string }) => {
      const { data } = await client.post(`paiements/${id}/pay`, { methode });
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["paiements"]);
        toast.success("Paiement effectué");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors du paiement");
      },
    },
  );
}
