import { useQuery } from "react-query";
import { client } from "../client";
import type { PaginatedVoitures, Voiture, VoitureFilters } from "./types";

export function useGetVoitures(filters?: VoitureFilters) {
  return useQuery(
    ["voitures", filters],
    async () => {
      const { data } = await client.get("voitures", { params: filters });
      // API may wrap the paginated object: { voitures: { current_page, data } }
      const raw: unknown = data?.voitures ?? data;
      if (Array.isArray(raw)) {
        return {
          current_page: 1,
          last_page: 1,
          total: (raw as Voiture[]).length,
          per_page: (raw as Voiture[]).length,
          data: raw as Voiture[],
        } satisfies PaginatedVoitures;
      }
      return raw as PaginatedVoitures;
    },
    { keepPreviousData: true },
  );
}
