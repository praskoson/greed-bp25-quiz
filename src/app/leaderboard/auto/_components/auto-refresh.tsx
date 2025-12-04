"use client";

import { Spinner } from "@/components/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AnimationsEnabledContext = createContext(true);

export function useAnimationsEnabled() {
  return useContext(AnimationsEnabledContext);
}

const REFRESH_INTERVAL_MS = 60_000; // 1 minute
const SHOW_LOADING_EARLY_MS = 2_000; // Show loading 2 seconds before refresh
const MIN_LOADING_DURATION_MS = 1_000; // Keep loading visible for at least 1 second

export function AutoRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const loadingStartTime = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const doRefresh = useCallback(() => {
    refresh();

    // Ensure loading indicator stays visible for at least MIN_LOADING_DURATION_MS
    const elapsed = Date.now() - loadingStartTime.current;
    const remainingTime = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);

    setTimeout(() => {
      setIsLoading(false);
    }, remainingTime);
  }, [refresh]);

  const showLoadingAndRefresh = useCallback(() => {
    setIsLoading(true);
    loadingStartTime.current = Date.now();

    // Wait a bit before actually refreshing so users can see the loading indicator
    setTimeout(doRefresh, SHOW_LOADING_EARLY_MS);
  }, [doRefresh]);

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(
      showLoadingAndRefresh,
      REFRESH_INTERVAL_MS,
    );
  }, [showLoadingAndRefresh]);

  // Auto-refresh interval
  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startInterval]);

  const showNotification = useCallback((message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(message);
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 2000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "r" || e.key === "R") {
        showLoadingAndRefresh();
        startInterval(); // Restart the interval
      }

      if (e.key === "a" || e.key === "A") {
        setAnimationsEnabled((prev) => {
          const next = !prev;
          showNotification(next ? "Animations enabled" : "Animations disabled");
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLoadingAndRefresh, startInterval, showNotification]);

  return (
    <AnimationsEnabledContext.Provider value={animationsEnabled}>
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-2">
          <Spinner className="size-8 text-brand-dark" />
        </div>
      )}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-4 left-4 z-50 bg-neutral/85 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </AnimationsEnabledContext.Provider>
  );
}
