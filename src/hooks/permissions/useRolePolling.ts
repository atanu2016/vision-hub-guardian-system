
import { useRef, useEffect, useCallback } from "react";
import type { UserRole } from "@/contexts/auth/types";

/**
 * Hook to set up periodic polling for role updates
 */
export function useRolePolling(
  userId: string | undefined,
  fetchFunction: () => Promise<void>,
  enabled = true,
  interval = 30000
) {
  const fetchTimerRef = useRef<number | null>(null);
  
  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    };
  }, []);
  
  // Setup polling interval
  useEffect(() => {
    if (!userId || !enabled) {
      // Clear any existing interval if conditions aren't met
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
      return;
    }
    
    // Initial fetch with slight delay
    const initialFetchTimeout = setTimeout(() => {
      fetchFunction();
    }, 200);
    
    // Set up polling interval
    if (fetchTimerRef.current) {
      clearInterval(fetchTimerRef.current);
    }
    
    fetchTimerRef.current = window.setInterval(fetchFunction, interval) as unknown as number;
    
    return () => {
      clearTimeout(initialFetchTimeout);
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    };
  }, [userId, fetchFunction, enabled, interval]);
  
  // Function to manually clear the timer
  const clearPolling = useCallback(() => {
    if (fetchTimerRef.current) {
      clearInterval(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
  }, []);
  
  return {
    clearPolling,
    isPolling: !!fetchTimerRef.current
  };
}
