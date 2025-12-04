"use client";

import dynamic from "next/dynamic";

export const LeaderboardRowNoSsr = dynamic(
  () => import("./table-row").then((mod) => mod.LeaderboardRow),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-1 col-span-full h-20 w-full rounded-2xl xl:h-[76px] xl:rounded-full xl:bg-[#f9f6f6]" />
    ),
  },
);
