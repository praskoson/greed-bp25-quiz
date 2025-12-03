"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useMediaQuery } from "usehooks-ts";

export function LeaderboardRow({ children }: { children: React.ReactNode }) {
  const isBig = useMediaQuery("(min-width: 1280px)", { defaultValue: false });
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.1, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [isBig ? 1 : 0.92, 1]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "w-full p-4 rounded-2xl bg-surface-1 max-xl:supports-[corner-shape:squircle]:rounded-[40px] max-xl:supports-[corner-shape:squircle]:[corner-shape:squircle]",
        "flex items-center justify-between xl:grid xl:grid-cols-subgrid xl:col-span-full xl:bg-[#F9F6F6] xl:rounded-full",
      )}
      initial={false}
      style={isBig ? {} : { scale, opacity }}
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
