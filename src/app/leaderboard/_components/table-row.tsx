"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useMediaQuery } from "usehooks-ts";

export function LeaderboardRow({
  children,
  address,
  totalScore,
}: {
  children: React.ReactNode;
  address: string;
  totalScore: number;
}) {
  const isBig = useMediaQuery("(min-width: 1280px)", { defaultValue: false });

  if (isBig) {
    return (
      <LeaderboardRowInnerDesktop
        key="big"
        address={address}
        totalScore={totalScore}
      >
        {children}
      </LeaderboardRowInnerDesktop>
    );
  }

  return (
    <LeaderboardRowInnerMobile
      key="small"
      address={address}
      totalScore={totalScore}
    >
      {children}
    </LeaderboardRowInnerMobile>
  );
}

function LeaderboardRowInnerDesktop({
  children,
  address,
  totalScore,
}: {
  children: React.ReactNode;
  address: string;
  totalScore: number;
}) {
  return (
    <div
      data-address={address}
      data-score={totalScore}
      className={cn(
        "bg-surface-1 w-full p-4",
        "col-span-full grid grid-cols-subgrid items-center justify-between rounded-full bg-[#F9F6F6]",
      )}
    >
      {children}
    </div>
  );
}

function LeaderboardRowInnerMobile({
  children,
  address,
  totalScore,
}: {
  children: React.ReactNode;
  address: string;
  totalScore: number;
}) {
  // const { publicKey } = useWallet();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "bg-surface-1 flex w-full items-center justify-between rounded-2xl p-4",
        "supports-[corner-shape:squircle]:rounded-[40px] supports-[corner-shape:squircle]:[corner-shape:squircle]",
        // address === publicKey?.toString() &&
        //   "outline-2 -outline-offset-2 outline-[#a37878]",
      )}
      initial={false}
      style={{ scale, opacity }}
      data-address={address}
      data-score={totalScore}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
}
