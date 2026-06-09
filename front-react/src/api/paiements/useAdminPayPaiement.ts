import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function useAdminPayPaiement() {
  const qc = useQueryClient();
  return useMutation(
    async ({ id, methode }: { id: number; methode: string }) => {
      const { data } = await client.post(`paiements/${id}/admin-pay`, { methode });
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["paiements"]);
        qc.invalidateQueries(["locations"]);
        toast.success("Paiement confirmé et location mise à jour");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la confirmation du paiement");
      },
    },
  );
}
