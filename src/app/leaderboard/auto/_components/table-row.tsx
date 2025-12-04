"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useAnimationsEnabled } from "./auto-refresh";

const rowClassName = cn(
  "w-full p-4 bg-surface-1",
  "items-center justify-between grid grid-cols-subgrid col-span-full bg-[#F9F6F6] rounded-full",
);

export function LeaderboardRowDesktop({
  children,
}: {
  children: React.ReactNode;
}) {
  const animationsEnabled = useAnimationsEnabled();

  if (animationsEnabled) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ layout: { duration: 0.3 } }}
        className={rowClassName}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={rowClassName}>{children}</div>;
}
