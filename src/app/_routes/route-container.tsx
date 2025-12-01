import { motion } from "motion/react";
import { ReactNode } from "react";

export function RouteContainer({ children }: { children: ReactNode }) {
  return (
    <div className="absolute top-3.5 inset-x-3.5 pb-3.5">
      <motion.div
        style={{ borderRadius: 28 }}
        className="bg-surface-2 h-auto min-h-[calc(100dvh-32px)] p-3 flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
}
