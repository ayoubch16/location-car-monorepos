import { useQuery } from "react-query";
import { client } from "./client";
import type { Voiture } from "../types";

export type VoitureFilters = {
  marque?: string;
  prix_max?: number;
  disponible?: boolean;
  page?: number;
};

export type VoituresPage = {
  data: Voiture[];
  current_page: number;
  last_page: number;
  total: number;
};

export function useVoitures(filters: VoitureFilters) {
  return useQuery<VoituresPage>(
    ["voitures", filters],
    async () => {
      const params: Record<string, string | number> = { page: filters.page ?? 1 };
      if (filters.marque)              params.marque   = filters.marque;
      if (filters.prix_max)            params.prix_max = filters.prix_max;
      if (filters.disponible === true) params.disponible = "true";
      const { data } = await client.get("voitures", { params });
      return data.voitures ?? data;
    },
    { keepPreviousData: true },
  );
}
