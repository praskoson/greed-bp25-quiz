// hooks/useWalletAuth.ts

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import bs58 from "bs58";

const TOKEN_STORAGE_KEY = "greed_academy_auth_token";
const WALLET_STORAGE_KEY = "greed_academy_wallet";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  token: string | null;
}

export function useWalletAuth() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    token: null,
  });

  const walletAddress = publicKey?.toBase58();

  /**
   * Save token to localStorage
   */
  const saveToken = useCallback((token: string, wallet: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(WALLET_STORAGE_KEY, wallet);
  }, []);

  /**
   * Clear token from localStorage
   */
  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  /**
   * Get stored token and wallet
   */
  const getStoredAuth = useCallback(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const wallet = localStorage.getItem(WALLET_STORAGE_KEY);
    return { token, wallet };
  }, []);

  /**
   * Validate token with backend
   */
  const validateToken = useCallback(async (token: string, wallet: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, walletAddress: wallet }),
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

      // Authenticate
      const authResponse = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
          timestamp,
        }),
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.error || "Authentication failed");
      }

      const { token } = await authResponse.json();

      // Validate token to get user info
      const user = await validateToken(token, walletAddress);

      if (!user) {
        throw new Error("Token validation failed");
      }

      // Save token
      saveToken(token, walletAddress);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        userId: user.userId,
        token,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        userId: null,
        token: null,
      });
      throw error;
    }
  }, [walletAddress, signMessage, saveToken, validateToken]);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    const { token } = getStoredAuth();

    if (token) {
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }

    clearToken();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      token: null,
    });

    disconnect();
  }, [clearToken, getStoredAuth, disconnect]);

  /**
   * Synchronize wallet connection with auth state
   */
  useEffect(() => {
    const syncAuthState = async () => {
      const { token, wallet } = getStoredAuth();

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

      // Wallet connected
      if (!token || !wallet) {
        // No stored auth
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
          token: null,
        });
        return;
      }

      // Check if wallet changed
      if (wallet !== walletAddress) {
        // Different wallet connected - invalidate old session
        await signOut();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
          token: null,
        });
        return;
      }

      // Same wallet - validate token
      const user = await validateToken(token, walletAddress);

      if (user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          userId: user.userId,
          token,
        });
      } else {
        // Token invalid - clear it
        clearToken();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
          token: null,
        });
      }
    };

    syncAuthState();
  }, [
    connected,
    walletAddress,
    getStoredAuth,
    validateToken,
    clearToken,
    signOut,
    authState.isAuthenticated,
  ]);

  return {
    ...authState,
    signIn,
    signOut,
    walletAddress,
  };
}
