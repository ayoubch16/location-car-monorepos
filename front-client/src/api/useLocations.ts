import { useQuery } from "react-query";
import { client } from "./client";
import type { Resa } from "../types";

export function useLocations() {
  return useQuery<Resa[]>(
    ["my-locations"],
    async () => {
      const { data } = await client.get("locations");
      return (data.locations?.data ?? data.locations ?? []) as Resa[];
    },
  );
}
