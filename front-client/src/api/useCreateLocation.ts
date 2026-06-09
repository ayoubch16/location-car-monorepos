import { useMutation, useQueryClient } from "react-query";
import { client } from "./client";

export type CreateLocationPayload = {
  voiture_id: number;
  date_debut: string;
  date_fin: string;
  duree_jours: number;
  lieu_prise_en_charge: string;
  lieu_retour: string;
};

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation(
    (payload: CreateLocationPayload) =>
      client.post("locations", payload).then((r) => r.data),
    { onSuccess: () => qc.invalidateQueries("my-locations") },
  );
}
