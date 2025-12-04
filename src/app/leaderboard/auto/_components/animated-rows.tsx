"use client";

import { AnimatePresence } from "motion/react";

export function AnimatedRows({ children }: { children: React.ReactNode }) {
  return <AnimatePresence>{children}</AnimatePresence>;
}
