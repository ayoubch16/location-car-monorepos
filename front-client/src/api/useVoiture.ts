import { useQuery } from "react-query";
import { client } from "./client";
import type { Voiture } from "../types";

export function useVoiture(id: number | null) {
  return useQuery<Voiture>(
    ["voiture", id],
    async () => {
      const { data } = await client.get(`voitures/${id}`);
      return data.voiture as Voiture;
    },
    { enabled: id !== null },
  );
}
