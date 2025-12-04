"use client";

import dynamic from "next/dynamic";

export const LeaderboardRowNoSsr = dynamic(
  () => import("./table-row").then((mod) => mod.LeaderboardRow),
  {
    ssr: false,
    loading: () => (
      <div className="w-full col-span-full h-20 rounded-2xl bg-surface-1 xl:h-[76px] xl:rounded-full xl:bg-[#f9f6f6]" />
    ),
  },
);
