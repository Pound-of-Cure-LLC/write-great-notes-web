"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { apiGet } from "@/lib/api-client";

import { logger } from "@/lib/logger";
export type TranscriptionStatus =
  | "not_recorded"
  | "recording"
  | "recorded"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "pushed_to_emr"
  | "signed";

export interface StatusData {
  status: TranscriptionStatus;
  transcription_id?: string;
  note_id?: string;
  error_message?: string;
  started_at?: string;
  created_at?: string;
}

export interface Note {
  id: string;
  is_signed: boolean;
}

interface TranscriptionStatusState {
  [transcriptionId: string]: {
    statusData: StatusData;
    note: Note | null;
    isLoading: boolean;
  };
}

interface TranscriptionStatusContextValue {
  statuses: TranscriptionStatusState;
  getStatus: (transcriptionId: string) => StatusData | null;
  getNote: (transcriptionId: string) => Note | null;
  isLoading: (transcriptionId: string) => boolean;
  subscribe: (transcriptionId: string) => void;
  unsubscribe: (transcriptionId: string) => void;
  refresh: (transcriptionId: string) => Promise<void>;
}

const TranscriptionStatusContext = createContext<TranscriptionStatusContextValue | undefined>(
  undefined
);

interface TranscriptionStatusProviderProps {
  children: ReactNode;
  transcriptionIds?: string[];
}

/**
 * TranscriptionStatusProvider: Centralized realtime subscription manager
 *
 * Purpose:
 * - Single Supabase realtime subscription per page (not per component)
 * - Shared state across all components on the page
 * - Cleaner component logic - components just consume status
 * - Better performance - one subscription instead of many
 *
 * Usage:
 * Wrap your page with this provider and pass transcription IDs to track:
 *
 * <TranscriptionStatusProvider transcriptionIds={[transcriptionId]}>
 *   <YourPageComponents />
 * </TranscriptionStatusProvider>
 *
 * Then consume status in any child component:
 *
 * const { getStatus, getNote } = useTranscriptionStatus();
 * const statusData = getStatus(transcriptionId);
 * const note = getNote(transcriptionId);
 */
export function TranscriptionStatusProvider({
  children,
  transcriptionIds = [],
}: TranscriptionStatusProviderProps) {
  const [statuses, setStatuses] = useState<TranscriptionStatusState>({});
  const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(new Set());

  // Use ref to avoid closure issues in realtime subscription callback
  const activeSubscriptionsRef = useRef<Set<string>>(new Set());

  // Track subscriptions currently being set up (prevents race conditions)
  const subscribingRef = useRef<Set<string>>(new Set());

  // Store organization_id in ref for realtime subscription callback
  const organizationIdRef = useRef<string | null>(null);

  // Fetch initial status for a transcription
  const fetchStatus = async (transcriptionId: string) => {
    logger.info(`🔍 Fetching initial status for transcription: ${transcriptionId}`);
    try {
      const status = await apiGet<StatusData>(
        `/transcription-status/by-transcription/${transcriptionId}`
      );
      logger.info(`✅ Fetched status for ${transcriptionId}:`, status);

      setStatuses((prev) => {
        const newState = {
          ...prev,
          [transcriptionId]: {
            statusData: status,
            note: prev[transcriptionId]?.note || null,
            isLoading: false,
          },
        };
        logger.info(`📝 Updated statuses state for ${transcriptionId}:`, newState[transcriptionId]);
        return newState;
      });

      // Fetch note if status has note_id
      if (status.note_id) {
        try {
          const noteData = await apiGet<Note>(`/notes/${status.note_id}`);
          setStatuses((prev) => ({
            ...prev,
            [transcriptionId]: {
              statusData: prev[transcriptionId]?.statusData || status,
              note: noteData,
              isLoading: prev[transcriptionId]?.isLoading || false,
            },
          }));
        } catch (error) {
          logger.error("Error fetching note:", error);
        }
      }
    } catch (error: unknown) {
      // Check for different error types
      const is404 =
        (error instanceof Error && error.message?.includes("404")) ||
        (error instanceof Error && error.message?.includes("Not Found"));
      
      const isNetworkError =
        error instanceof TypeError && error.message === "Failed to fetch";

      // Only log non-network, non-404 errors (these are unexpected)
      // Network errors and 404s are expected and handled silently
      if (!is404 && !isNetworkError) {
        logger.error("Error fetching transcription status:", error);
      } else if (isNetworkError && process.env.NODE_ENV === "development") {
        // Log network errors in development for debugging
        logger.debug("Network error fetching transcription status (expected if backend unavailable):", transcriptionId);
      }

      // Always set default status, even for network errors
      // This prevents UI from getting stuck in loading state
      setStatuses((prev) => ({
        ...prev,
        [transcriptionId]: {
          statusData: { status: "not_recorded" },
          note: null,
          isLoading: false,
        },
      }));
    }
  };

  // Subscribe to realtime updates for a transcription
  const subscribe = useCallback((transcriptionId: string) => {
    if (!transcriptionId) {
      logger.warn("⚠️ Subscribe called with empty transcriptionId");
      return;
    }

    // ✅ SYNCHRONOUS check (prevents race conditions)
    if (subscribingRef.current.has(transcriptionId)) {
      logger.debug(`⏭️ Skipping subscription for ${transcriptionId} - already subscribing`);
      return;
    }

    if (activeSubscriptionsRef.current.has(transcriptionId)) {
      logger.debug(`⏭️ Skipping subscription for ${transcriptionId} - already subscribed`);
      return;
    }

    logger.info(`🔔 Subscribing to transcription status updates for: ${transcriptionId}`);

    // Mark as subscribing SYNCHRONOUSLY (before any async operations)
    subscribingRef.current.add(transcriptionId);

    // Check if already subscribed (async check - kept for safety)
    setActiveSubscriptions((prev) => {
      if (prev.has(transcriptionId)) {
        subscribingRef.current.delete(transcriptionId);
        return prev; // Already subscribed
      }

      // Mark as loading
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [transcriptionId]: {
          statusData: prevStatuses[transcriptionId]?.statusData || { status: "not_recorded" },
          note: prevStatuses[transcriptionId]?.note || null,
          isLoading: true,
        },
      }));

      // Fetch initial status
      fetchStatus(transcriptionId).finally(() => {
        // Clean up subscribing flag after fetch completes
        subscribingRef.current.delete(transcriptionId);
      });

      // Update ref for realtime callback (avoid closure issues)
      const nextSet = new Set(prev).add(transcriptionId);
      activeSubscriptionsRef.current = nextSet;

      // Add to subscriptions
      return nextSet;
    });
  }, []);

  // Unsubscribe from a transcription (cleanup)
  const unsubscribe = useCallback((transcriptionId: string) => {
    // Clean up subscribing flag (in case unsubscribe happens during setup)
    subscribingRef.current.delete(transcriptionId);

    setActiveSubscriptions((prev) => {
      const next = new Set(prev);
      next.delete(transcriptionId);

      // Update ref for realtime callback (avoid closure issues)
      activeSubscriptionsRef.current = next;

      if (process.env.NODE_ENV === 'development') {
        logger.debug('[TranscriptionStatus] Unsubscribed from', transcriptionId);
      }

      return next;
    });
  }, []);

  // Manually refresh status for a transcription (useful after cancel operations)
  const refresh = useCallback(async (transcriptionId: string) => {
    if (!transcriptionId) {
      logger.warn("⚠️ Refresh called with empty transcriptionId");
      return;
    }

    logger.info(`🔄 Manually refreshing status for transcription: ${transcriptionId}`);
    await fetchStatus(transcriptionId);
  }, []); // fetchStatus is stable, doesn't need to be in deps

  // Setup a SINGLE realtime subscription for ALL transcription_status INSERT events
  // Client-side filtering will handle organization_id and transcription_id matching
  useEffect(() => {
    const supabase = createClient();

    const setupSubscription = async () => {
      // Get current session for organization_id filtering
      const { data: { session } } = await supabase.auth.getSession();
      organizationIdRef.current = session?.user?.app_metadata?.organization_id || null;

      logger.info("🔐 Realtime subscription setup:", {
        authenticated: !!session,
        userId: session?.user?.id,
        organizationId: organizationIdRef.current,
        activeSubscriptionsCount: activeSubscriptions.size,
      });

      // Use broadcast pattern instead of postgres_changes
      // This avoids "mismatch" errors and provides better security via RLS on realtime.messages
      // Backend triggers broadcast to channels like: transcription_status:{transcription_id}
      // We subscribe to multiple channels (one per active transcription)
      
      logger.info(`📡 Setting up broadcast subscriptions for ${activeSubscriptions.size} transcription(s)`, {
        organizationId: organizationIdRef.current,
        pattern: "broadcast (secure, RLS-protected)",
      });

      const channels: RealtimeChannel[] = [];

      // Subscribe to broadcast channels for each active transcription
      // Each channel is: transcription_status:{transcription_id}
      // RLS on realtime.messages ensures only authorized users receive broadcasts
      activeSubscriptions.forEach((transcriptionId) => {
        const channelName = `transcription_status:${transcriptionId}`;
        logger.info(`📡 Creating broadcast channel: ${channelName}`);

        const channel = supabase
          .channel(channelName)
          .on(
            "broadcast",
            {
              event: "status_change", // Matches trigger event name
            },
            (payload) => {
              logger.info("🎉 RAW BROADCAST EVENT RECEIVED:", payload);
              logger.info("🎉 Full payload:", JSON.stringify(payload, null, 2));
              
              // Broadcast payload structure: { payload: { transcription_id, status, note_id, ... } }
              const statusData = payload.payload as any;
              
              if (!statusData) {
                logger.warn("⚠️ Received broadcast event with no payload data");
                return;
              }

              logger.info("📦 Extracted broadcast data:", {
                transcription_id: statusData.transcription_id,
                status: statusData.status,
                note_id: statusData.note_id,
              });

              const receivedTranscriptionId = statusData.transcription_id;

              // Verify this matches the channel we're subscribed to
              if (receivedTranscriptionId !== transcriptionId) {
                logger.warn("⚠️ Broadcast transcription_id mismatch:", {
                  received: receivedTranscriptionId,
                  expected: transcriptionId,
                });
                return;
              }

              logger.info("✅ Broadcast event received:", {
                transcriptionId: receivedTranscriptionId,
                status: statusData.status,
                noteId: statusData.note_id,
              });

              const statusDataObj: StatusData = {
                status: statusData.status,
                transcription_id: statusData.transcription_id,
                ...(statusData.note_id && { note_id: statusData.note_id }),
                ...(statusData.error_message && { error_message: statusData.error_message }),
                ...(statusData.started_at && { started_at: statusData.started_at }),
                ...(statusData.created_at && { created_at: statusData.created_at }),
              };

              setStatuses((prev) => {
                const prevStatus = prev[receivedTranscriptionId]?.statusData?.status;
                const newStatus = statusDataObj.status;
                
                if (prevStatus !== newStatus) {
                  logger.info(`📊 Status change: ${prevStatus} → ${newStatus} for ${receivedTranscriptionId}`);
                }

                return {
                  ...prev,
                  [receivedTranscriptionId]: {
                    statusData: { ...statusDataObj },
                    note: prev[receivedTranscriptionId]?.note || null,
                    isLoading: false,
                  },
                };
              });

              // Fetch note if status includes note_id
              if (statusDataObj.note_id) {
                apiGet<Note>(`/notes/${statusDataObj.note_id}`)
                  .then((noteData) => {
                    setStatuses((prev) => ({
                      ...prev,
                      [receivedTranscriptionId]: {
                        statusData: prev[receivedTranscriptionId]?.statusData || statusDataObj,
                        note: noteData,
                        isLoading: prev[receivedTranscriptionId]?.isLoading || false,
                      },
                    }));
                  })
                  .catch((error) => logger.error("Error fetching note:", error));
              }
            }
          )
          .subscribe((status, err) => {
            if (err) {
              logger.error(`❌ Broadcast subscription ERROR for ${channelName}:`, err);
            } else {
              logger.info(`✅ Broadcast subscription CONNECTED for ${channelName}:`, status);
            }
          });

        channels.push(channel);
      });

      return channels;
    };

    let channels: RealtimeChannel[] = [];

    setupSubscription().then((ch) => {
      channels = ch;
    });

    return () => {
      if (channels.length > 0) {
        logger.info(`🧹 Cleaning up ${channels.length} broadcast subscription channel(s)`);
        channels.forEach((channel) => {
          supabase.removeChannel(channel);
        });
      }
    };
  }, [activeSubscriptions]); // Re-subscribe when active subscriptions change

  // Auto-subscribe to provided transcriptionIds
  useEffect(() => {
    transcriptionIds.forEach((id) => {
      if (id) {
        subscribe(id);
      }
    });
  }, [transcriptionIds, subscribe]);

  // Memoize context value to prevent unnecessary re-renders
  // BUT ensure it updates when statuses change (statuses in dependency array)
  const contextValue: TranscriptionStatusContextValue = useMemo(() => ({
    statuses,
    getStatus: (transcriptionId: string) => statuses[transcriptionId]?.statusData || null,
    getNote: (transcriptionId: string) => statuses[transcriptionId]?.note || null,
    isLoading: (transcriptionId: string) => statuses[transcriptionId]?.isLoading || false,
    subscribe,
    unsubscribe,
    refresh,
  }), [statuses, subscribe, unsubscribe, refresh]);

  return (
    <TranscriptionStatusContext.Provider value={contextValue}>
      {children}
    </TranscriptionStatusContext.Provider>
  );
}

/**
 * Hook to access transcription status from context
 */
export function useTranscriptionStatus() {
  const context = useContext(TranscriptionStatusContext);
  if (!context) {
    throw new Error(
      "useTranscriptionStatus must be used within a TranscriptionStatusProvider"
    );
  }
  return context;
}
