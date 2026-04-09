import { useEffect, useRef } from "react";
import { refreshSessionWithRefreshToken } from "@/lib/api/login";
import { tokenRefreshIntervalMs } from "@/lib/config";
import { useAuthStore } from "@/stores/authStore";

function isLikelyTransientNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    return true;
  }
  if (!(err instanceof Error)) {
    return false;
  }
  const m = err.message;
  return (
    m.includes("Network request failed") ||
    m.includes("Failed to fetch") ||
    m.includes("network") ||
    m.includes("timed out") ||
    m.includes("timeout")
  );
}

/**
 * Periodically refreshes access/refresh tokens while the user is signed in.
 * Interval comes from `TOKEN_REFRESH_INTERVAL_MS` in project root `.env`.
 * OS may throttle `setInterval` while the app is backgrounded.
 */
export function useTokenRefreshInterval() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const inFlight = useRef(false);

  useEffect(() => {
    if (tokenRefreshIntervalMs == null || refreshToken == null) {
      return;
    }

    const tick = async () => {
      if (inFlight.current) return;
      const state = useAuthStore.getState();
      const rt = state.refreshToken;
      if (rt == null) return;
      inFlight.current = true;
      try {
        const session = await refreshSessionWithRefreshToken(rt, state.user);
        const after = useAuthStore.getState();
        if (after.refreshToken == null) return;
        signIn(session);
      } catch (e) {
        if (isLikelyTransientNetworkError(e)) {
          return;
        }
        signOut();
      } finally {
        inFlight.current = false;
      }
    };

    const id = setInterval(tick, tokenRefreshIntervalMs);
    return () => clearInterval(id);
  }, [refreshToken, signIn, signOut]);
}
