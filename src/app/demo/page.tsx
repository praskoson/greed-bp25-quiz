"use client";

import { AnimatedGreedLoader } from "@/components/greed-loader";
import { motion } from "motion/react";

const stateTransition = {
  duration: 0.4,
  ease: "easeOut" as const,
};

const stateVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: stateTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" as const },
  },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: stateTransition,
  },
};

export default function Demo() {
  return (
    <div className="isolate relative min-h-dvh bg-brand overflow-auto">
      <div className="absolute top-3.5 inset-x-3.5 pb-3.5">
        <motion.div
          style={{ borderRadius: 28 }}
          className="bg-surface-2 h-auto min-h-[calc(100dvh-32px)] p-3 flex flex-col"
        >
          <motion.div
            key="loading"
            className="flex-1 flex flex-col items-center justify-center gap-2 pb-40"
            variants={stateVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center gap-2"
            >
              {/* Use div instead of motion.div to prevent variant inheritance from breaking the loader's animation */}
              <div>
                <AnimatedGreedLoader />
              </div>
              <motion.div className="text-center" variants={fadeSlideUp}>
                <h2 className="text-[32px]/[85%] font-black text-neutral tracking-[-0.4px] font-futura">
                  Verifying Stake...
                </h2>
                <p className="mt-4 text-sm text-[#7E1D1D]">
                  This usually takes a few seconds
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
