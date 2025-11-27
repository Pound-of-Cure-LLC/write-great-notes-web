"use client";

import { useState, useCallback } from "react";
import { apiGet } from "@/lib/api-client";
import type { PastNote } from "@/types/past-note";

import { logger } from "@/lib/logger";
interface UsePastNotesReturn {
  notes: PastNote[];
  loading: boolean;
  error: Error | null;
  fetchNotes: (patientId: string, limit?: number) => Promise<void>;
}

/**
 * Custom hook for fetching and managing past notes for a patient
 *
 * Features:
 * - Fetches notes from `/patients/{patientId}/past-notes` endpoint
 * - Manages loading and error states
 * - Returns filtered, non-empty, non-duplicate notes (handled by backend)
 * - Memoized fetch function to prevent unnecessary re-renders
 *
 * Usage:
 * ```tsx
 * const { notes, loading, error, fetchNotes } = usePastNotes();
 *
 * useEffect(() => {
 *   if (patientId) {
 *     fetchNotes(patientId, 20);
 *   }
 * }, [patientId, fetchNotes]);
 * ```
 */
export function usePastNotes(): UsePastNotesReturn {
  const [notes, setNotes] = useState<PastNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async (patientId: string, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<{ notes: PastNote[] }>(
        `/patients/${patientId}/past-notes?limit=${limit}`
      );
      setNotes(response.notes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch past notes";
      logger.error("Error fetching past notes:", errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notes,
    loading,
    error,
    fetchNotes,
  };
}
