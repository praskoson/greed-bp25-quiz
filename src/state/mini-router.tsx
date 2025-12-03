"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Available routes in the app
 */
export type Route = "sign-in" | "stake" | "failed" | "polling" | "quiz";

type MiniRouterContextValue = {
  /** Current active route */
  route: Route;
  /** Previous route (useful for animations) */
  previousRoute: Route | null;
  /** Navigate to a new route */
  navigate: (to: Route) => void;
  /** Go back to the previous route (if available) */
  goBack: () => void;
  /** Check if we can go back */
  canGoBack: boolean;
};

const MiniRouterContext = createContext<MiniRouterContextValue | null>(null);

type MiniRouterProviderProps = {
  children: ReactNode;
  /** Initial route to start on (defaults to "home") */
  initialRoute?: Route;
};

export function MiniRouterProvider({
  children,
  initialRoute = "sign-in",
}: MiniRouterProviderProps) {
  const [route, setRoute] = useState<Route>(initialRoute);
  const [previousRoute, setPreviousRoute] = useState<Route | null>(null);
  const [history, setHistory] = useState<Route[]>([initialRoute]);

  const navigate = useCallback(
    (to: Route) => {
      if (to === route) return; // Don't navigate to the same route
      setPreviousRoute(route);
      setRoute(to);
      setHistory((prev) => [...prev, to]);
    },
    [route],
  );

  const goBack = useCallback(() => {
    if (history.length <= 1) return;

    const newHistory = history.slice(0, -1);
    const newRoute = newHistory[newHistory.length - 1];

    setPreviousRoute(route);
    setRoute(newRoute);
    setHistory(newHistory);
  }, [history, route]);

  const canGoBack = history.length > 1;

  const value = useMemo(
    () => ({
      route,
      previousRoute,
      navigate,
      goBack,
      canGoBack,
    }),
    [route, previousRoute, navigate, goBack, canGoBack],
  );

  return (
    <MiniRouterContext.Provider value={value}>
      {children}
    </MiniRouterContext.Provider>
  );
}

/**
 * Hook to access the mini router
 */
export function useMiniRouter() {
  const context = useContext(MiniRouterContext);

  if (!context) {
    throw new Error("useMiniRouter must be used within a MiniRouterProvider");
  }

  return context;
}

/**
 * Hook that returns true when the current route matches the given route
 */
export function useIsRoute(route: Route) {
  const { route: currentRoute } = useMiniRouter();
  return currentRoute === route;
}

/**
 * Component that only renders its children when the route matches
 */
type RouteProps = {
  route: Route;
  children: ReactNode;
};

export function RouteView({ route, children }: RouteProps) {
  const { route: currentRoute } = useMiniRouter();

  if (currentRoute !== route) {
    return null;
  }

  return <>{children}</>;
}
