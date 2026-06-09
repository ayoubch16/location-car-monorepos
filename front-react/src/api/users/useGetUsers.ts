import { useQuery } from "react-query";
import { client } from "../client";
import type { PaginatedUsers, User, UserFilters } from "./types";

export function useGetUsers(filters?: UserFilters) {
  return useQuery(
    ["users", filters],
    async () => {
      const { data } = await client.get("users", { params: filters });
      // API may wrap: { users: { current_page, data } }
      const raw: unknown = data?.users ?? data;
      if (Array.isArray(raw)) {
        return {
          current_page: 1,
          last_page: 1,
          total: (raw as User[]).length,
          per_page: (raw as User[]).length,
          data: raw as User[],
        } satisfies PaginatedUsers;
      }
      return raw as PaginatedUsers;
    },
    { keepPreviousData: true },
  );
}
