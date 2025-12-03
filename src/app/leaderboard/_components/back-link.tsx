"use client";

import { Spinner } from "@/components/spinner";
import { useMiniRouter } from "@/state/mini-router";
import { useWalletAuth } from "@/state/use-wallet-auth";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function BackLink() {
  const { signOut } = useWalletAuth();
  const { navigate } = useMiniRouter();
  const { push } = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  const checkIfAtBottom = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY;

    // Check if page is not scrollable or if at bottom
    const isNotScrollable = scrollHeight <= clientHeight;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    return isNotScrollable || isAtBottom;
  }, []);

  useEffect(() => {
    // Check on mount if page is scrollable
    if (checkIfAtBottom()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    }
  }, [checkIfAtBottom]);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = lastScrollY.current;

    // Always show if at bottom or page isn't scrollable
    if (checkIfAtBottom()) {
      setIsVisible(true);
      lastScrollY.current = current;
      return;
    }

    // Scrolling down - hide
    if (current > previous && current > 50) {
      setIsVisible(false);
    }
    // Scrolling up - show
    else if (current < previous) {
      setIsVisible(true);
    }

    lastScrollY.current = current;
  });

  return (
    <motion.div
      className="xl:hidden fixed z-10 inset-x-0 bottom-0 bg-surface-2 h-[50px] px-4"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <button
        onClick={async () => {
          setIsSigningOut(true);
          await signOut();
          navigate("sign-in");

          push("/");
        }}
        className="absolute top-0 -translate-y-1/2 inset-x-4 bg-neutral/85 rounded-full py-4 px-8 text-sm/[130%] text-white whitespace-pre backdrop-blur-lg"
      >
        {isSigningOut ? <Spinner className="size-4 inline" /> : "←"} Back to
        Home
      </button>
    </motion.div>
  );
}
