import { queryOptions } from "@tanstack/react-query";

export const RQKEY_ROOT = "stake_session";
export const RQKEY = (walletAddress: string) => [RQKEY_ROOT, walletAddress];

export const stakeStatusOptions = (walletAddress?: string) =>
  queryOptions({
    enabled: !!walletAddress,
    queryKey: RQKEY(walletAddress!),
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/stake/status", {
        credentials: "include",
        signal,
      });
      if (!response.ok) {
        throw Error(JSON.stringify(await response.json()));
      }

      return response.json();
    },
  });
