import { useMutation, useQueryClient } from "react-query";
import { client } from "./client";

export function useCancelLocation() {
  const qc = useQueryClient();
  return useMutation(
    (id: number) => client.post(`locations/${id}/cancel`).then((r) => r.data),
    { onSuccess: () => qc.invalidateQueries("my-locations") },
  );
}
