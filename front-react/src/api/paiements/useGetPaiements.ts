import { useQuery } from "react-query";
import { client } from "../client";
import type { PaginatedPaiements, PaiementFilters } from "./types";

export function useGetPaiements(filters?: PaiementFilters) {
  return useQuery(
    ["paiements", filters],
    async () => {
      const { data } = await client.get<{ paiements: PaginatedPaiements }>("paiements", { params: filters });
      return data.paiements.data.map((p) => ({ ...p, montant: Number(p.montant) }));
    },
    { keepPreviousData: true },
  );
}
