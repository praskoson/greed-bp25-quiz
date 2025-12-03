"use client";

import { type Route, useMiniRouter } from "@/state/mini-router";
import { HomeRoute } from "./_routes/home-route";
import { StakeRoute } from "./_routes/stake-route";
import { PollingRoute } from "./_routes/polling-route";
import { AnimatePresence, motion, Variants } from "motion/react";
import { QuizRoute } from "./_routes/quiz-route";
import { StakeMoreRoute } from "./_routes/stake-more-route";

// Route order for determining navigation direction
const routeOrder: Record<Route, number> = {
  "sign-in": 0,
  "stake-more": 1,
  stake: 2,
  polling: 4,
  quiz: 3,
  failed: 4,
};

// Get direction: 1 = forward (exit left), -1 = backward (exit right)
function getDirection(
  currentRoute: Route,
  previousRoute: Route | null,
): number {
  if (!previousRoute) return 1;

  // Default: compare route order
  return routeOrder[currentRoute] > routeOrder[previousRoute] ? 1 : -1;
}

const pageVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: {
      x: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.3 },
    },
  }),
};

export default function Home() {
  // const { isAuthenticated, isLoading } = useWalletAuth();
  const { route, previousRoute } = useMiniRouter();

  const direction = getDirection(route, previousRoute);

  return (
    <div className="isolate relative min-h-dvh overflow-hidden">
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        {route === "sign-in" && (
          <motion.div
            key="sign-in"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-y-auto overflow-x-clip"
          >
            <HomeRoute />
          </motion.div>
        )}
        {route === "stake-more" && (
          <motion.div
            key="stake-more"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
          >
            <StakeMoreRoute />
          </motion.div>
        )}
        {route === "stake" && (
          <motion.div
            key="stake"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
          >
            <StakeRoute />
          </motion.div>
        )}
        {route === "polling" && (
          <motion.div
            key="polling"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
          >
            <PollingRoute />
          </motion.div>
        )}
        {route === "quiz" && (
          <motion.div
            key="quiz"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
          >
            <QuizRoute />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
