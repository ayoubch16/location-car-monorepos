import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation(
    async (id: number) => {
      await client.delete(`users/${id}`);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["users"]);
        toast.success("Utilisateur supprimé");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? "Erreur lors de la suppression");
      },
    },
  );
}
