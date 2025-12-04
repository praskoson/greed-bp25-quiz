"use client";

import { Spinner } from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const REFRESH_INTERVAL_MS = 10_000; // 1 minute
const SHOW_LOADING_EARLY_MS = 2_000; // Show loading 2 seconds before refresh
const MIN_LOADING_DURATION_MS = 1_000; // Keep loading visible for at least 1 second

export function AutoRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTime = useRef<number>(0);

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

  useEffect(() => {
    const intervalId = setInterval(showLoadingAndRefresh, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [showLoadingAndRefresh]);

  return (
    <>
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-2">
          <Spinner className="size-8 text-brand-dark" />
        </div>
      )}
      {children}
    </>
  );
}
