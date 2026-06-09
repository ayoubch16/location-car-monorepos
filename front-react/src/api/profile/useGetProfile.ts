import { useQuery } from "react-query";
import { client } from "../client";
import type { AuthUser } from "core/cookies";

export function useGetProfile() {
  return useQuery(
    ["profile"],
    async () => {
      const { data } = await client.get("auth/me");
      // API may wrap: { user: { ... } } or { data: { ... } }
      return (data?.user ?? data?.data ?? data) as AuthUser;
    },
    { staleTime: 30_000 },
  );
}
