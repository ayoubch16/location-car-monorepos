import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { client } from "../client";
import { signOutCookie } from "core";

export function useLogout() {
  return useMutation(
    async () => {
      await client.post("auth/logout");
    },
    {
      // Always clear the local session — even if the server call fails
      onSuccess: () => {
        toast.success("Déconnexion réussie.");
        signOutCookie();
      },
      onError: () => {
        toast.success("Déconnexion réussie.");
        signOutCookie();
      },
    },
  );
}
