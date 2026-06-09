import { useQuery } from "react-query";
import { client } from "../client";
import type { LocationFilters } from "./types";
import type { Location } from "./types";

export function useGetLocations(filters?: LocationFilters) {
  return useQuery<Location[]>(
    ["locations", filters],
    async () => {
      const { data } = await client.get("locations", { params: filters });
      // API retourne { locations: { data: [...], current_page, ... } }
      return data?.locations?.data ?? data?.data ?? [];
    },
    { keepPreviousData: true },
  );
}
