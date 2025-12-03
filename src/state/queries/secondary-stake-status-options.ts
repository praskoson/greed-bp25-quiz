import { queryOptions } from "@tanstack/react-query";

export const RQKEY_ROOT = "secondary_stake_status";
export const RQKEY = (stakeId: string) => [RQKEY_ROOT, stakeId];

export type SecondaryStakeStatusResponse = {
  success: true;
  status: "failed" | "processing" | "success" | null;
};

export const secondaryStakeStatusOptions = (stakeId?: string) =>
  queryOptions({
    enabled: !!stakeId,
    queryKey: RQKEY(stakeId!),
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/stake/secondary/status?stakeId=${stakeId}`,
        {
          credentials: "include",
          signal,
        },
      );
      if (!response.ok) {
        throw Error(JSON.stringify(await response.json()));
      }

      return response.json() as Promise<SecondaryStakeStatusResponse>;
    },
  });
