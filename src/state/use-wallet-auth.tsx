import { useWallet } from "@solana/wallet-adapter-react";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import bs58 from "bs58";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

interface WalletAuthContextValue extends AuthState {
  signIn: () => Promise<{
    status: "success" | "failed" | "processing" | null;
  }>;
  signOut: () => Promise<void>;
  walletAddress: string | undefined;
}

const WalletAuthContext = createContext<WalletAuthContextValue | null>(null);

function useWalletAuthInternal() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
  });
  const syncInProgress = useRef(false);
  const [syncTrigger, setSyncTrigger] = useState(0);

  const walletAddress = publicKey?.toBase58();

  /**
   * Get stored wallet address from cookie
   */
  const getStoredWallet = (): string | null => {
    const cookies = document.cookie.split(";");
    const authWalletCookie = cookies.find((c) =>
      c.trim().startsWith("auth_wallet="),
    );

    if (!authWalletCookie) return null;

    return authWalletCookie.split("=")[1];
  };

  /**
   * Check if auth cookies exist
   */
  const hasAuthCookies = (): boolean => {
    return document.cookie.includes("auth_wallet=");
  };

  /**
   * Validate token with backend
   */
  const validateToken = useCallback(async (wallet: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet }),
        credentials: "include", // Important: include cookies
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.valid ? data.user : null;
    } catch (error) {
      console.error("Token validation failed:", error);
      return null;
    }
  }, []);

  /**
   * Sign in with wallet
   */
  const signIn = useCallback(async () => {
    if (!walletAddress || !signMessage) {
      throw new Error("Wallet not connected");
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // Get message to sign
      const messageResponse = await fetch("/api/auth/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to get sign-in message");
      }

      const { message, timestamp } = await messageResponse.json();

      // Sign message
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Authenticate (cookies will be set automatically)
      const authResponse = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
          timestamp,
        }),
        credentials: "include", // Important: include cookies
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.error || "Authentication failed");
      }

      const responseBody = (await authResponse.json()) as {
        walletAddress: string;
        expiresIn: number;
        status: "success" | "failed" | "processing" | null;
      };

      // Trigger a sync to re-read cookies and validate
      setSyncTrigger((prev) => prev + 1);

      return { status: responseBody.status };
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        userId: null,
      });
      throw error;
    }
  }, [walletAddress, signMessage]);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include", // Important: include cookies
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      userId: null,
    });
    void disconnect();
  }, [disconnect]);

  /**
   * Synchronize wallet connection with auth state
   */
  useEffect(() => {
    const syncAuthState = async () => {
      // Prevent concurrent syncs
      if (syncInProgress.current) {
        return;
      }

      syncInProgress.current = true;

      try {
        const storedWallet = getStoredWallet();
        const hasCookies = hasAuthCookies();

        // No wallet connected
        if (!connected || !walletAddress) {
          if (authState.isAuthenticated) {
            // Wallet disconnected but still authenticated - sign out
            await signOut();
          } else {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
          return;
        }

        // Wallet connected but no auth cookies
        if (!hasCookies) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
          });
          return;
        }

        // Check if wallet changed
        if (storedWallet && storedWallet !== walletAddress) {
          // Different wallet connected - sign out
          await signOut();
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
          });
          return;
        }

        // Same wallet - validate token
        const user = await validateToken(walletAddress);

        if (user) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            userId: user.userId,
          });
        } else {
          // Token invalid
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
          });
        }
      } finally {
        syncInProgress.current = false;
      }
    };

    syncAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, walletAddress, syncTrigger]);

  return {
    ...authState,
    signIn,
    signOut,
    walletAddress,
  };
}

export function WalletAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useWalletAuthInternal();

  return (
    <WalletAuthContext.Provider value={auth}>
      {children}
    </WalletAuthContext.Provider>
  );
}

export function useWalletAuth() {
  const context = useContext(WalletAuthContext);

  if (!context) {
    throw new Error("useWalletAuth must be used within WalletAuthProvider");
  }

  return context;
}
