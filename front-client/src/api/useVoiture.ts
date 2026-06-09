import { useQuery } from "react-query";
import toast from "react-hot-toast";
import { client } from "./client";
import type { Voiture } from "../types";

export function useVoiture(id: number | null) {
  return useQuery<Voiture>(
    ["voiture", id],
    async () => {
      const { data } = await client.get(`voitures/${id}`);
      return data.voiture as Voiture;
    },
    {
      enabled: id !== null,
      onError: () => toast.error("Erreur lors du chargement du véhicule."),
    },
  );
}
