"use client";

import { AppLayout } from "@/components/AppLayout";
import { AppointmentOnlyCard } from "@/components/AppointmentOnlyCard";
import { CapabilitiesFetcher } from "@/components/CapabilitiesFetcher";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { NoteActionsBar } from "@/components/NoteActionsBar";
import { NoteCard } from "@/components/NoteCard";
import { PastNotesDialog } from "@/components/PastNotesDialog";
import { PatientCard } from "@/components/PatientCard";
import type { SelectedProvider } from "@/components/ProviderPicker";
import { SubscriptionWarningDialog } from "@/components/SubscriptionWarningDialog";
import { PatientDetailsTabContent } from "@/components/tabs/PatientDetailsTabContent";
import { ProvidersTabContent } from "@/components/tabs/ProvidersTabContent";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VitalsSection } from "@/components/VitalsSection";
import {
  TranscriptionStatusProvider,
  useTranscriptionStatus,
} from "@/contexts/TranscriptionStatusContext";
import { usePastNotes } from "@/hooks/usePastNotes";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import type { AppointmentViewModel } from "@/lib/use-appointments";
import { useAppointments } from "@/lib/use-appointments";
import { useUserProfile } from "@/lib/use-user-profile";
import type { PatientProvidersResponse, Vital, VitalDefinition } from "@/types";
import type { TranscriptionStatus } from "@/types/note";
import type { PastNote } from "@/types/past-note";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Stethoscope,
  StickyNote,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface PatientSummary {
  id: string;
  first_name: string;
  last_name: string;
  mrn?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  full_name?: string | null;
  is_local?: boolean;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
}

interface Appointment {
  id: string;
  patient_id?: string | null;
  provider_id?: string;
  provider_name?: string | null; // Provider/physician name
  appointment_datetime: string;
  visit_type_id?: string;
  appointment_details?: string;
  connection_id?: string | null; // EMR connection ID for external appointments
  is_telemed?: boolean; // Telemed indicator
  patient?: PatientSummary; // Nested patient object from UI-optimized response
  transcription_status?: TranscriptionStatus;
  visit_type?: {
    id: string | null;
    name: string;
  };
  emr_settings?: {
    reason_for_appointment?: string;
    emr_visit_type?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

interface User {
  uid: string;
  email: string;
  default_visit_type?: string | null; // Backend returns "default_visit_type" not "default_visit_type_id"
}

interface Transcription {
  id: string;
  transcription_text: string;
  provider_notes: string;
  recording_duration_seconds?: number;
  visit_type_id?: string;
  transcription_status?: TranscriptionStatus;
}

interface StatusData {
  status: string;
  transcription_id?: string;
  note_id?: string;
}

interface VisitType {
  id: string;
  name: string;
  duration_minutes: number;
  emr_settings?: {
    charm_visit_type_ids?: string[];
  };
}

type SidebarSection =
  | "details"
  | "notes"
  | "past-notes"
  | "summary"
  | "appointments"
  | "vitals"
  | "providers";

// Inner component that uses transcription status hook (must be inside TranscriptionStatusProvider)
function TranscribeActionBar({
  transcriptionId,
  appointmentId,
  visitTypeId,
  onGenerate,
  onRegenerate,
  onViewNote,
  canGenerate,
}: {
  transcriptionId: string | null;
  appointmentId: string;
  visitTypeId: string;
  onGenerate: () => void;
  onRegenerate: () => void;
  onViewNote: () => void;
  canGenerate: boolean;
}) {
  const { statuses } = useTranscriptionStatus();
  const statusData = transcriptionId
    ? statuses[transcriptionId]?.statusData
    : null;
  const status = statusData?.status || "not_recorded";

  // Only use showInlineOnly when status is "recorded" - show full menu for completed/pushed/signed
  // This ensures buttons (Regenerate Note, Push to EMR, etc.) appear after recording
  const showInlineOnly = status === "recorded";

  return (
    <div className="flex justify-end">
      <NoteActionsBar
        transcriptionId={transcriptionId}
        appointmentId={appointmentId}
        visitTypeId={visitTypeId}
        onGenerate={onGenerate}
        onRegenerate={onRegenerate}
        onViewNote={onViewNote}
        canGenerate={canGenerate}
        showInlineOnly={showInlineOnly}
        editTemplateMode="redirect"
      />
    </div>
  );
}

export default function TranscribePage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  // Use SWR hook for user profile (instant render from cache, no shuffling)
  const { data: profile } = useUserProfile();
  const currentUser = profile
    ? {
        uid: profile.uid,
        email: profile.email,
        default_visit_type: profile.default_visit_type,
      }
    : null;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [patientFormData, setPatientFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    mrn: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
  });
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [transcription, setTranscription] = useState<Transcription | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [providerNotes, setProviderNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordingElapsedTime, setRecordingElapsedTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isZoomAudioEnabled, setIsZoomAudioEnabled] = useState(false); // Tracks if Zoom audio is currently active

  // Subscription warning dialog state
  const [subscriptionWarningOpen, setSubscriptionWarningOpen] = useState(false);
  const [subscriptionWarningType, setSubscriptionWarningType] = useState<
    "no-subscription" | "limit-exceeded" | "inactive"
  >("no-subscription");
  const [subscriptionUsage, setSubscriptionUsage] = useState<
    { current: number; limit: number } | undefined
  >();

  // Sidebar navigation
  const [activeSection, setActiveSection] = useState<SidebarSection>("notes");
  const [selectedPastNote, setSelectedPastNote] = useState<PastNote | null>(
    null
  );
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>(
    []
  );
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Use custom hook for past notes
  const {
    notes: pastNotes,
    loading: pastNotesLoading,
    fetchNotes: fetchPastNotes,
  } = usePastNotes();

  // Vitals data (prefetched)
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [vitalDefinitions, setVitalDefinitions] = useState<VitalDefinition[]>(
    []
  );
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [providers, setProviders] = useState<SelectedProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  // Visit type selection
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [selectedVisitTypeId, setSelectedVisitTypeId] = useState<string>("");
  const [visitTypesLoading, setVisitTypesLoading] = useState(false);

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTextRef = useRef<string>(""); // Finalized text only
  const currentInterimRef = useRef<string>(""); // Current interim utterance (replaced on each update)
  const transcriptionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const hasFetchedPastNotesRef = useRef<boolean>(false); // Prevent double-fetch
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Auto-stop after 5min silence
  const reconnectionAttemptsRef = useRef<number>(0); // Track WebSocket reconnection attempts
  const persistentDisplayStreamRef = useRef<MediaStream | null>(null); // Persistent Zoom window capture across recordings

  // Extract transcription ID for status subscription (must be before early returns)
  const transcriptionIds = useMemo(() => {
    return transcription?.id ? [transcription.id] : [];
  }, [transcription?.id]);

  // Get filters from sessionStorage (same as appointments page)
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];
      const stored = sessionStorage.getItem("appointmentFilters");
      if (!stored) return [];
      try {
        const parsed = JSON.parse(stored);
        return parsed.providerIds ?? [];
      } catch {
        return [];
      }
    }
  );

  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];
      const stored = sessionStorage.getItem("appointmentFilters");
      if (!stored) return [];
      try {
        const parsed = JSON.parse(stored);
        return parsed.locationIds ?? [];
      } catch {
        return [];
      }
    }
  );

  // Get appointment date for fetching schedule appointments
  const appointmentDate = useMemo(() => {
    if (!appointment?.appointment_datetime) return null;
    const aptDate = new Date(appointment.appointment_datetime);
    // Normalize to local midnight to prevent timezone issues
    return new Date(
      aptDate.getFullYear(),
      aptDate.getMonth(),
      aptDate.getDate()
    );
  }, [appointment?.appointment_datetime]);

  // Fetch appointments for the current date with filters (for navigation)
  // Only fetch if we have filters and an appointment date
  // Always use a valid date to prevent hook order changes
  const filtersReady =
    selectedProviderIds.length > 0 && selectedLocationIds.length > 0;
  const dateForFetch = appointmentDate ?? new Date();
  const {
    data: scheduleAppointments = [],
    isLoading: scheduleAppointmentsLoading,
  } = useAppointments(dateForFetch, selectedProviderIds, selectedLocationIds);

  // Find current appointment index and get previous/next appointments
  // Match by appointment.id - handle both URL formats (with/without connection_id prefix)
  const currentAppointmentIndex = useMemo(() => {
    if (!scheduleAppointments.length || !appointmentId) return -1;

    // Extract the base appointment ID from URL (remove connection_id:: prefix if present)
    const urlAppointmentId = appointmentId.includes("::")
      ? appointmentId.split("::")[1]
      : appointmentId;

    // Match appointments - handle both formats
    return scheduleAppointments.findIndex((apt) => {
      // Extract base ID from appointment (remove connection_id:: prefix if present)
      const aptBaseId = apt.id.includes("::") ? apt.id.split("::")[1] : apt.id;

      // Match by base ID (works for both formats)
      return aptBaseId === urlAppointmentId || apt.id === appointmentId;
    });
  }, [scheduleAppointments, appointmentId]);

  const previousAppointment = useMemo(() => {
    if (currentAppointmentIndex <= 0) return null;
    return scheduleAppointments[currentAppointmentIndex - 1];
  }, [scheduleAppointments, currentAppointmentIndex]);

  const nextAppointment = useMemo(() => {
    if (
      currentAppointmentIndex < 0 ||
      currentAppointmentIndex >= scheduleAppointments.length - 1
    )
      return null;
    return scheduleAppointments[currentAppointmentIndex + 1];
  }, [scheduleAppointments, currentAppointmentIndex]);

  // Navigation handlers
  // Construct URL with correct appointment ID format
  // If current URL has emr_type:: prefix, preserve it for navigation
  const getAppointmentUrl = (apt: AppointmentViewModel): string => {
    // Check if current appointmentId has emr_type:: prefix (e.g., "charm::12345")
    const hasPrefix = appointmentId.includes("::");
    if (hasPrefix) {
      // Extract emr_type from current URL (e.g., "charm" from "charm::12345")
      const [emrType] = appointmentId.split("::");
      // Construct URL with prefix: emr_type::appointment_id
      return `/appointments/${emrType}::${apt.id}/transcribe`;
    }
    // No prefix - use appointment.id directly (works for local appointments)
    return `/appointments/${apt.id}/transcribe`;
  };

  const handlePreviousAppointment = () => {
    if (previousAppointment) {
      router.push(getAppointmentUrl(previousAppointment));
    }
  };

  const handleNextAppointment = () => {
    if (nextAppointment) {
      router.push(getAppointmentUrl(nextAppointment));
    }
  };

  // Get the last selected schedule date and save to localStorage
  const getScheduleDateUrl = (): string => {
    // Save appointment date to localStorage before navigation
    if (appointment?.appointment_datetime) {
      const aptDate = new Date(appointment.appointment_datetime);
      const year = aptDate.getFullYear();
      const month = String(aptDate.getMonth() + 1).padStart(2, "0");
      const day = String(aptDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      localStorage.setItem("appointmentsDate", dateStr);
    }
    // Always return to appointments page - date is managed by localStorage
    return "/appointments";
  };

  // Fetch appointment and transcription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointment (includes nested patient data from UI-optimized response)
        const apt = await apiGet<Appointment>(`/appointments/${appointmentId}`);
        setAppointment(apt);

        // Use nested patient data from appointment (no separate API call needed)
        if (apt.patient) {
          setPatient(apt.patient);
        } else {
          logger.error("Appointment missing patient data");
        }

        // Get or create transcription
        try {
          // For external appointments, pass connection_id as query parameter
          const transcriptionUrl = apt.connection_id
            ? `/transcriptions/by-appointment/${appointmentId}?connection_id=${apt.connection_id}`
            : `/transcriptions/by-appointment/${appointmentId}`;

          let existingTranscription = await apiGet<Transcription | null>(
            transcriptionUrl
          );

          logger.debug("Existing transcription:", existingTranscription);

          if (existingTranscription) {
            // Use existing transcription
            setTranscription(existingTranscription);
            setTranscriptionText(existingTranscription.transcription_text);
            setProviderNotes(existingTranscription.provider_notes);
            // Restore recording duration from saved transcription
            if (existingTranscription.recording_duration_seconds) {
              setRecordingElapsedTime(
                existingTranscription.recording_duration_seconds
              );
              recordingStartTimeRef.current =
                Date.now() -
                existingTranscription.recording_duration_seconds * 1000;
            }
          } else {
            // Create new transcription
            logger.debug(
              "Creating new transcription for appointment:",
              appointmentId
            );

            // For external EMR appointments, include connection_id
            const transcriptionPayload: {
              appointment_id: string;
              initial_text: string;
              connection_id?: string;
              visit_type_id?: string;
            } = {
              appointment_id: appointmentId,
              initial_text: "",
            };

            // Add connection_id for external appointments (Charm, Epic, etc.)
            if (apt.connection_id) {
              transcriptionPayload.connection_id = apt.connection_id;
            }

            // Add visit_type_id if selected
            if (selectedVisitTypeId) {
              transcriptionPayload.visit_type_id = selectedVisitTypeId;
            }

            const newTranscription = await apiPost<Transcription>(
              `/transcriptions`,
              transcriptionPayload
            );
            logger.debug("Created transcription:", newTranscription);
            setTranscription(newTranscription);
            // Patient context will be loaded asynchronously by separate useEffect
          }
        } catch (transcriptionError) {
          logger.error("Error with transcription:", transcriptionError);
          // If transcription already exists (duplicate key error), try to fetch it
          try {
            const transcriptionUrl = apt.connection_id
              ? `/transcriptions/by-appointment/${appointmentId}?connection_id=${apt.connection_id}`
              : `/transcriptions/by-appointment/${appointmentId}`;
            const existingTranscription = await apiGet<Transcription | null>(
              transcriptionUrl
            );
            if (existingTranscription) {
              setTranscription(existingTranscription);
              setTranscriptionText(existingTranscription.transcription_text);
              setProviderNotes(existingTranscription.provider_notes);
              // Restore recording duration from saved transcription
              if (existingTranscription.recording_duration_seconds) {
                setRecordingElapsedTime(
                  existingTranscription.recording_duration_seconds
                );
                recordingStartTimeRef.current =
                  Date.now() -
                  existingTranscription.recording_duration_seconds * 1000;
              }
            }
          } catch (retryError) {
            logger.error(
              "Failed to fetch transcription after error:",
              retryError
            );
          }
        }
      } catch (error: unknown) {
        logger.error("Error fetching appointment:", error);
        // Don't set error state - just log and continue
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  // Note: Status tracking and note fetching moved to TranscribeNoteButtons component
  // No need for handleStatusChange, statusData state, or note fetching here

  // Asynchronously fetch patient context after page loads (if provider notes are empty)
  useEffect(() => {
    const fetchPatientContext = async () => {
      // Only fetch if:
      // 1. We have a transcription
      // 2. Provider notes are empty (no context loaded yet)
      // 3. Appointment ID is available
      if (!transcription?.id || providerNotes.trim() !== "" || !appointmentId) {
        return;
      }

      try {
        logger.debug("Fetching patient context asynchronously...");
        const response = await apiGet<{ patient_context: string }>(
          `/appointments/${appointmentId}/patient-context`
        );

        if (
          response.patient_context &&
          response.patient_context.trim() !== ""
        ) {
          // Update provider notes with fetched context
          setProviderNotes(response.patient_context);

          // Save to database
          await apiPatch(`/transcriptions/${transcription.id}`, {
            provider_notes: response.patient_context,
          });

          logger.debug("Patient context loaded successfully");
        }
      } catch (error) {
        logger.error("Failed to fetch patient context:", error);
        // Silently fail - this is not critical to the workflow
      }
    };

    fetchPatientContext();
  }, [transcription?.id, appointmentId, providerNotes]); // Run when transcription becomes available

  // Fetch visit types on mount
  useEffect(() => {
    const fetchVisitTypes = async () => {
      setVisitTypesLoading(true);
      try {
        const types = await apiGet<VisitType[]>("/visit-types");
        setVisitTypes(types);
      } catch (error) {
        logger.error("Error fetching visit types:", error);
      } finally {
        setVisitTypesLoading(false);
      }
    };
    fetchVisitTypes();
  }, []);

  // Initialize selected visit type when appointment loads
  // Priority: transcription's visit_type_id > appointment's visit_type_id > user's default_visit_type
  useEffect(() => {
    if (!appointment || !appointmentId) return;

    // First priority: use transcription's saved visit_type_id if available
    if (transcription?.visit_type_id) {
      setSelectedVisitTypeId(transcription.visit_type_id);
    } else if (appointment.visit_type_id) {
      setSelectedVisitTypeId(appointment.visit_type_id);
    } else if (currentUser?.default_visit_type) {
      // Use user's default visit type as fallback
      setSelectedVisitTypeId(currentUser.default_visit_type);

      // Only update local appointments - external EMR appointments are read-only
      if (!appointment.connection_id) {
        const updateAppointmentWithDefault = async () => {
          try {
            const updatedAppointment = await apiPatch<Appointment>(
              `/appointments/${appointmentId}`,
              { visit_type_id: currentUser.default_visit_type }
            );
            setAppointment(updatedAppointment);
            logger.debug(
              "Updated appointment with default visit type:",
              currentUser.default_visit_type
            );
          } catch (error) {
            logger.error(
              "Error updating appointment with default visit type:",
              error
            );
          }
        };
        updateAppointmentWithDefault();
      } else {
        // External appointment - just set the selection, don't try to update
        logger.debug(
          "External appointment - using default visit type locally:",
          currentUser.default_visit_type
        );
      }
    }
  }, [
    appointmentId,
    currentUser?.default_visit_type,
    appointment?.connection_id,
    appointment?.visit_type_id,
    transcription?.visit_type_id,
  ]);

  // Auto-save transcription on text change or recording time change
  useEffect(() => {
    if (!transcription?.id) return;

    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    // Set new timeout for auto-save (500ms debounce)
    autoSaveTimeout.current = setTimeout(async () => {
      try {
        // Save transcription
        await apiPatch(`/transcriptions/${transcription.id}`, {
          transcription_text: transcriptionText,
          provider_notes: providerNotes,
          recording_duration_seconds: recordingElapsedTime,
        });

        // Update status to "recorded" if there's transcription text and not currently recording
        // This handles manual text entry or paste
        if (transcriptionText.trim() && !isRecording) {
          try {
            // Get current status first
            const currentStatus = await apiGet<{ status: string }>(
              `/transcription-status/by-transcription/${transcription.id}`
            );

            // Only update if status is "not_recorded"
            if (currentStatus.status === "not_recorded") {
              await apiPost(
                `/transcription-status/by-transcription/${transcription.id}`,
                {
                  status: "recorded",
                }
              );
              logger.debug(
                "Updated status to 'recorded' after manual text entry"
              );
            }
          } catch (error) {
            logger.error("Error updating transcription status:", error);
          }
        }
      } catch (error) {
        logger.error("Error auto-saving transcription:", error);
      }
    }, 500);

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [transcriptionText, providerNotes, transcription?.id, isRecording]);

  // Auto-scroll to bottom during recording
  useEffect(() => {
    if (transcriptionTextareaRef.current && isRecording) {
      transcriptionTextareaRef.current.scrollTop =
        transcriptionTextareaRef.current.scrollHeight;
    }
  }, [transcriptionText, isRecording]);

  // Track recording elapsed time
  useEffect(() => {
    if (isRecording && recordingStartTimeRef.current) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor(
          (now - recordingStartTimeRef.current!) / 1000
        );
        setRecordingElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Handle tab visibility changes to prevent false silence timeout
  // When user switches tabs, browser throttles timers - pause silence timeout to prevent auto-stop
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        // Tab hidden - clear silence timeout to prevent false timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        logger.info("Tab hidden - paused silence timeout");
      } else if (!document.hidden && isRecording) {
        // Tab visible again - restart silence timeout
        resetSilenceTimeout();
        logger.info("Tab visible - resumed silence timeout");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRecording]);

  // Cleanup persistent display stream on component unmount
  useEffect(() => {
    return () => {
      // Stop display stream tracks when navigating away
      if (persistentDisplayStreamRef.current) {
        persistentDisplayStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        persistentDisplayStreamRef.current = null;
        logger.info("Cleaned up persistent display stream on unmount");
      }
    };
  }, []);

  // Prefetch past notes when patient is loaded (not waiting for tab switch)
  useEffect(() => {
    if (patient?.id && !hasFetchedPastNotesRef.current) {
      hasFetchedPastNotesRef.current = true;
      fetchPastNotes(patient.id, 20);
    }
  }, [patient?.id, fetchPastNotes]);

  // Prefetch summary generation as soon as past notes are loaded
  useEffect(() => {
    const generateSummary = async () => {
      if (patient && pastNotes.length > 0 && !summary) {
        setSummaryLoading(true);
        try {
          const response = await apiPost<{ summary: string }>(
            `/patients/${patient.id}/generate-summary`,
            { notes: pastNotes }
          );
          setSummary(response.summary);
        } catch (error) {
          logger.error("Error generating summary:", error);
          setSummary("Failed to generate summary. Please try again.");
        } finally {
          setSummaryLoading(false);
        }
      }
    };

    generateSummary();
  }, [patient?.id, pastNotes.length, summary]);

  // Prefetch patient appointments when patient is loaded
  useEffect(() => {
    const fetchAppointments = async () => {
      if (patient && patientAppointments.length === 0) {
        setAppointmentsLoading(true);
        try {
          const today = new Date();
          const tenYearsAgo = new Date();
          tenYearsAgo.setFullYear(today.getFullYear() - 10);
          const tenYearsFromNow = new Date();
          tenYearsFromNow.setFullYear(today.getFullYear() + 10);

          // Format dates as YYYY-MM-DD
          const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          // Fetch all appointments for this patient (server-side filtering by patient_id)
          // Use EMR visit type to show original Charm visit type names
          const response = await apiGet<{ appointments: Appointment[] }>(
            `/appointments?patient_id=${patient.id}&start_date=${formatDate(
              tenYearsAgo
            )}&end_date=${formatDate(tenYearsFromNow)}&use_emr_visit_type=true`
          );

          // Filter out the current appointment
          const filtered = response.appointments.filter(
            (apt) => apt.id !== appointmentId
          );

          setPatientAppointments(filtered);
        } catch (error) {
          logger.error("Error fetching appointments:", error);
        } finally {
          setAppointmentsLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [patient?.id, patientAppointments.length, appointmentId]);

  // Prefetch vitals when patient is loaded
  useEffect(() => {
    const fetchVitals = async () => {
      if (patient && vitals.length === 0) {
        setVitalsLoading(true);
        try {
          // Fetch vitals and vital definitions in parallel
          const [vitalsData, vitalDefsData] = await Promise.all([
            apiGet<{ vitals: Vital[] }>(`/vitals/by-patient/${patient.id}`),
            apiGet<{ vital_definitions: VitalDefinition[] }>(
              "/vital-definitions"
            ),
          ]);

          setVitals(vitalsData.vitals);
          setVitalDefinitions(vitalDefsData.vital_definitions || []);
        } catch (error) {
          logger.error("Error fetching vitals:", error);
        } finally {
          setVitalsLoading(false);
        }
      }
    };

    fetchVitals();
  }, [patient?.id, vitals.length]);

  // Prefetch providers when patient is loaded
  useEffect(() => {
    const fetchProviders = async () => {
      if (patient && providers.length === 0) {
        setProvidersLoading(true);
        try {
          const data = await apiGet<PatientProvidersResponse>(
            `/patients/${patient.id}/providers`
          );

          // Map to SelectedProvider format
          const mappedProviders: SelectedProvider[] = data.providers.map(
            (p) => {
              const base = {
                id: p.organization_provider_id,
                organization_id:
                  p.provider?.organization_id || p.organization_id || "",
                provider_name:
                  p.provider?.provider_name ||
                  p.provider_name ||
                  "Unknown Provider",
                source: (p.provider?.source || p.source || "custom") as
                  | "npi"
                  | "custom",
                is_active: p.provider?.is_active ?? p.is_active ?? true,
                is_primary: p.is_primary,
                receives_communication: p.receives_communication,
                is_referring: p.is_referring ?? false,
              };

              // Add optional fields only if they have values
              const npi = p.provider?.npi || p.npi;
              const credentials = p.provider?.credentials || p.credentials;
              const specialty = p.provider?.specialty || p.specialty;
              const address = p.provider?.address || p.address;
              const phone = p.provider?.phone || p.phone;
              const fax = p.provider?.fax || p.fax;
              const notes = p.notes;

              return {
                ...base,
                ...(npi && { npi }),
                ...(credentials && { credentials }),
                ...(specialty && { specialty }),
                ...(address && { address }),
                ...(phone && { phone }),
                ...(fax && { fax }),
                ...(notes && { notes }),
              };
            }
          );

          setProviders(mappedProviders);
        } catch (error) {
          logger.error("Error fetching providers:", error);
        } finally {
          setProvidersLoading(false);
        }
      }
    };

    fetchProviders();
  }, [patient?.id, providers.length]);

  // Update patient form data when patient is loaded
  useEffect(() => {
    if (patient) {
      setPatientFormData({
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        mrn: patient.mrn || "",
        address_street: patient.address_street || "",
        address_city: patient.address_city || "",
        address_state: patient.address_state || "",
        address_zip: patient.address_zip || "",
      });
    }
  }, [patient]);

  // Patient save handler
  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setPatientError("");
    setSavingPatient(true);

    try {
      const cleanedData = {
        ...patientFormData,
        date_of_birth: patientFormData.date_of_birth || null,
        gender: patientFormData.gender || null,
        phone: patientFormData.phone || null,
        email: patientFormData.email || null,
        mrn: patientFormData.mrn || null,
      };

      await apiPatch(`/patients/${patient.id}`, cleanedData);

      // Update local patient state
      setPatient({
        ...patient,
        ...cleanedData,
      });

      toast.success("Patient details saved successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save patient details";
      setPatientError(message);
      toast.error(message);
    } finally {
      setSavingPatient(false);
    }
  };

  // Patient inactivate handler
  const handleInactivatePatient = async () => {
    if (!patient) return;

    try {
      await apiPatch(`/patients/${patient.id}`, { is_active: false });
      toast.success("Patient inactivated successfully");
      router.push("/patients");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to inactivate patient";
      setPatientError(message);
      toast.error(message);
    }
  };

  const handleProvidersUpdate = async () => {
    // Refresh providers after update
    setProviders([]);
  };

  // Format recording time as MM:SS
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Helper: Reset silence timeout (auto-stop after 5 minutes of no audio)
  const resetSilenceTimeout = () => {
    // Clear existing timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    // Set new timeout for 5 minutes (300000ms)
    silenceTimeoutRef.current = setTimeout(() => {
      logger.info("Auto-stopping recording after 5 minutes of silence");
      toast.info("Recording stopped automatically after 5 minutes of silence");
      stopRecording();
    }, 300000);
  };

  const startRecording = async () => {
    console.log("🎙️ startRecording() called");

    if (!transcription) {
      logger.error("No transcription found - transcription state is null");
      toast.error(
        "Unable to start recording. Please refresh the page and try again."
      );
      return;
    }

    console.log("✅ Transcription exists, starting recording...");
    setIsRecording(true);
    // Resume from current elapsed time, or start fresh if 0
    recordingStartTimeRef.current = Date.now() - recordingElapsedTime * 1000;

    // Reset reconnection attempts for new recording
    reconnectionAttemptsRef.current = 0;

    // Initialize silence timeout
    resetSilenceTimeout();

    try {
      // Step 1: Add transcription status "recording" (timeline log)
      await apiPost(
        `/transcription-status/by-transcription/${transcription.id}`,
        {
          status: "recording",
        }
      );

      // Step 2: Capture current transcription text in ref
      accumulatedTextRef.current = transcriptionText;

      // Step 3: Create WebSocket connection to backend (which proxies to Deepgram)
      // Backend handles Deepgram authentication and keeps API key secure
      // Get access token for WebSocket authentication
      const supabase = createClient();

      // Refresh session to ensure we have a valid, non-expired token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.refreshSession();

      if (sessionError || !session?.access_token) {
        logger.error(
          "Failed to get valid session for WebSocket authentication",
          { sessionError }
        );
        toast.error("Authentication error. Please log in again.");
        setIsRecording(false);
        return;
      }

      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const wsProtocol = backendUrl.startsWith("https") ? "wss" : "ws";
      const wsBaseUrl = backendUrl.replace(/^https?:\/\//, "");
      const wsUrl = `${wsProtocol}://${wsBaseUrl}/transcriptions/stream?token=${encodeURIComponent(
        session.access_token
      )}`;

      logger.debug(
        `Connecting to backend WebSocket: ${wsUrl.replace(
          /token=[^&]+/,
          "token=***"
        )}`
      );
      const socket = new WebSocket(wsUrl);

      // Set connection timeout (10 seconds)
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          logger.error("WebSocket connection timeout after 10 seconds");
          socket.close();
          toast.error(
            "Connection timeout. Please check your internet connection and try again."
          );
          setIsRecording(false);
        }
      }, 10000);

      // WebSocket message handler (defined once for reuse on reconnect)
      const handleMessage = async (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          // Handle info messages from backend (e.g., connection restored)
          if (data.type === "info") {
            logger.info("Backend info:", data.message);
            // Reconnection happens silently - no user notification needed
            return;
          }

          // Handle error messages from backend
          if (data.type === "error") {
            logger.error("Backend error:", data.message);
            toast.error(`Transcription error: ${data.message}`);
            stopRecording();
            return;
          }

          // Handle transcript messages
          if (data.type === "transcript" && data.text && data.text.trim()) {
            const transcript = data.text;
            const isFinal = data.is_final ?? true; // Default to final for backward compatibility

            // Reset silence timeout - we got audio activity
            resetSilenceTimeout();

            if (isFinal) {
              // Final result - add to accumulated text (permanent)
              const updatedText = accumulatedTextRef.current
                ? `${accumulatedTextRef.current}\n${transcript}`
                : transcript;

              accumulatedTextRef.current = updatedText;
              currentInterimRef.current = ""; // Clear interim buffer
              setTranscriptionText(updatedText);

              // Auto-save final results to backend
              try {
                const currentDuration = recordingStartTimeRef.current
                  ? Math.floor(
                      (Date.now() - recordingStartTimeRef.current) / 1000
                    )
                  : recordingElapsedTime;

                await apiPatch(`/transcriptions/${transcription.id}`, {
                  transcription_text: updatedText,
                  provider_notes: providerNotes,
                  recording_duration_seconds: currentDuration,
                });
              } catch (error) {
                logger.error("Error auto-saving segment:", error);
              }
            } else {
              // Interim result - update temporary buffer (replaced on each update, not appended)
              currentInterimRef.current = transcript;

              // Display = accumulated (final) + current interim
              const displayText = accumulatedTextRef.current
                ? `${accumulatedTextRef.current}\n${transcript}`
                : transcript;

              setTranscriptionText(displayText);
              // Don't save interim results to database
            }
          }
        } catch (parseError) {
          logger.error("Error parsing backend message:", parseError);
        }
      };

      socket.onopen = () => {
        clearTimeout(connectionTimeout); // Clear connection timeout
        logger.info("Backend WebSocket connection established successfully");
        reconnectionAttemptsRef.current = 0; // Reset on successful connection
        toast.success("Recording started");
      };

      socket.onmessage = handleMessage;

      socket.onerror = (event) => {
        // WebSocket error events don't contain detailed error info
        // The actual error details come from the onclose event
        logger.error("Backend WebSocket error detected", {
          readyState: socket.readyState,
          readyStateText:
            ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][socket.readyState] ||
            "UNKNOWN",
        });
        // Don't stop recording immediately - let onclose handler manage reconnection
      };

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout); // Clear connection timeout
        logger.debug("Backend WebSocket closed", {
          code: event.code,
          reason: event.reason,
        });

        // Handle authentication failures (code 1008 = policy violation, used for auth errors)
        if (event.code === 1008) {
          logger.error("WebSocket authentication failed", {
            reason: event.reason,
          });
          toast.error(
            "Authentication failed. Please refresh the page and log in again."
          );
          setIsRecording(false);
          return;
        }

        // If still recording and connection closed unexpectedly, attempt to reconnect
        if (isRecording && event.code !== 1000) {
          const maxAttempts = 5;

          if (reconnectionAttemptsRef.current >= maxAttempts) {
            logger.error(`Max reconnection attempts (${maxAttempts}) reached`);
            toast.error("Connection lost. Please restart recording.");
            setIsRecording(false);
            return;
          }

          reconnectionAttemptsRef.current += 1;
          const backoffDelay = Math.min(
            2 ** reconnectionAttemptsRef.current * 1000,
            10000
          ); // Exponential backoff, max 10s

          logger.warn(
            `WebSocket closed unexpectedly. Reconnection attempt ${reconnectionAttemptsRef.current}/${maxAttempts} in ${backoffDelay}ms...`,
            { code: event.code, reason: event.reason }
          );

          // Wait with exponential backoff and attempt to reconnect
          setTimeout(async () => {
            if (!isRecording) {
              logger.debug("Recording stopped - cancelling reconnection");
              return;
            }

            logger.info(
              `Attempting WebSocket reconnection (${reconnectionAttemptsRef.current}/${maxAttempts})...`
            );
            try {
              // Get fresh token and reconnect
              const supabase = createClient();
              const {
                data: { session: newSession },
                error: refreshError,
              } = await supabase.auth.refreshSession();

              if (refreshError || !newSession?.access_token) {
                logger.error("Failed to refresh session for reconnection", {
                  refreshError,
                });
                toast.error(
                  "Connection lost. Please stop and restart recording."
                );
                setIsRecording(false);
                return;
              }

              const newWsUrl = `${wsProtocol}://${wsBaseUrl}/transcriptions/stream?token=${encodeURIComponent(
                newSession.access_token
              )}`;
              const newSocket = new WebSocket(newWsUrl);

              // Set up handlers for reconnected socket
              newSocket.onopen = () => {
                logger.info("WebSocket reconnected successfully!");
                toast.success("Connection restored");
                reconnectionAttemptsRef.current = 0; // Reset on success
              };

              newSocket.onmessage = handleMessage;
              newSocket.onerror = socket.onerror;
              newSocket.onclose = socket.onclose;

              // Update global reference
              (window as any).__backendSocket = newSocket;

              // Update mediaRecorder to send to new socket
              const mediaRecorder = (window as any).__mediaRecorder;
              if (mediaRecorder) {
                mediaRecorder.ondataavailable = (event: BlobEvent) => {
                  if (
                    event.data.size > 0 &&
                    newSocket.readyState === WebSocket.OPEN
                  ) {
                    newSocket.send(event.data);
                  }
                };
              }
            } catch (reconnectError) {
              logger.error(
                `Failed to reconnect WebSocket (attempt ${reconnectionAttemptsRef.current}/${maxAttempts})`,
                {
                  reconnectError,
                }
              );
              // Will retry on next backoff if under max attempts
            }
          }, backoffDelay);
        }
      };

      // Step 4: Capture microphone audio
      // Zoom audio can be added later via "Add Zoom Audio" button
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      // Check if we already have a cached display stream from previous recording
      let displayStream: MediaStream | null = null;
      if (persistentDisplayStreamRef.current) {
        const activeTracks = persistentDisplayStreamRef.current
          .getTracks()
          .filter((t) => t.readyState === "live");
        if (activeTracks.length > 0) {
          displayStream = persistentDisplayStreamRef.current;
          logger.info("Reusing existing Zoom window capture");
        } else {
          logger.info("Cached display stream is inactive");
          persistentDisplayStreamRef.current = null;
        }
      }

      // Determine which audio stream(s) to use
      let stream: MediaStream;
      let audioContext: AudioContext | null = null;

      // Check if we have Zoom audio to mix
      const hasZoomAudio =
        displayStream && displayStream.getAudioTracks().length > 0;

      if (hasZoomAudio) {
        // Mix microphone and Zoom audio using Web Audio API
        audioContext = new AudioContext({ sampleRate: 48000 });

        // Resume audio context (required by Chrome's autoplay policy)
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const destination = audioContext.createMediaStreamDestination();

        // Add microphone audio
        const micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(destination);

        // Add Zoom audio
        const displaySource = audioContext.createMediaStreamSource(
          new MediaStream(displayStream!.getAudioTracks())
        );
        displaySource.connect(destination);

        stream = destination.stream;
        setIsZoomAudioEnabled(true);
        logger.info("Mixing microphone + Zoom audio");
      } else {
        // Use microphone only (no mixing needed)
        stream = micStream;
        setIsZoomAudioEnabled(false);
        logger.info("Recording with microphone only");
      }

      // Step 5: Create MediaRecorder to stream audio to backend
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
          // Note: Don't reset silence timeout here - audio chunks are sent
          // continuously even during silence. We only reset when Deepgram
          // detects actual speech and sends transcripts.
        }
      };

      mediaRecorder.onerror = (error) => {
        logger.error("MediaRecorder error:", error);
        setIsRecording(false);
      };

      // Start recording (send chunks every 250ms)
      mediaRecorder.start(250);

      // Store for cleanup
      (window as any).__backendSocket = socket;
      (window as any).__mediaRecorder = mediaRecorder;
      (window as any).__mediaStream = stream;
      (window as any).__micStream = micStream;
      (window as any).__displayStream = displayStream;
      (window as any).__audioContext = audioContext;
    } catch (error) {
      logger.error("Error starting recording:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to start recording: ${errorMessage}`);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    const socket = (window as any).__backendSocket;
    const mediaRecorder = (window as any).__mediaRecorder;
    const stream = (window as any).__mediaStream;
    const micStream = (window as any).__micStream;
    const displayStream = (window as any).__displayStream;
    const audioContext = (window as any).__audioContext;

    // Reset reconnection attempts
    reconnectionAttemptsRef.current = 0;

    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    // Stop all media stream tracks (mixed stream)
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    // Stop microphone stream tracks
    if (micStream) {
      micStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    // DON'T stop display stream - keep it alive for next recording
    // It will persist across patients until user stops sharing or Zoom closes
    // (Display stream cleanup happens via track.onended event handler)

    // Close audio context
    if (audioContext && audioContext.state !== "closed") {
      await audioContext.close();
    }

    // Close backend WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      delete (window as any).__backendSocket;
    }

    // Cleanup
    delete (window as any).__mediaRecorder;
    delete (window as any).__mediaStream;
    delete (window as any).__micStream;
    delete (window as any).__displayStream;
    delete (window as any).__audioContext;

    setIsRecording(false);

    // Update Zoom audio status based on persistent stream
    if (persistentDisplayStreamRef.current) {
      const activeTracks = persistentDisplayStreamRef.current
        .getTracks()
        .filter((t) => t.readyState === "live");
      setIsZoomAudioEnabled(activeTracks.length > 0);
    } else {
      setIsZoomAudioEnabled(false);
    }

    // Add status "recorded"
    if (transcription) {
      try {
        await apiPost(
          `/transcription-status/by-transcription/${transcription.id}`,
          {
            status: "recorded",
          }
        );
      } catch (error) {
        logger.error("Error adding status:", error);
      }
    }
  };

  const addZoomAudio = async () => {
    try {
      // Prompt user to select Zoom window with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required for getDisplayMedia
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      // Check if audio tracks are available
      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        toast.warning(
          <div>
            <strong>No audio detected.</strong>
            <br />
            When selecting the Zoom window, make sure to{" "}
            <strong>check the "Share audio" checkbox</strong> at the bottom of
            the screen share dialog.
          </div>
        );
        displayStream.getTracks().forEach((track) => track.stop());
        return;
      }

      // Store for future recordings
      persistentDisplayStreamRef.current = displayStream;

      // Detect when user stops sharing or Zoom closes
      displayStream.getTracks().forEach((track) => {
        track.onended = () => {
          logger.info(
            "Display stream track ended (user stopped sharing or Zoom closed)"
          );
          persistentDisplayStreamRef.current = null;
          setIsZoomAudioEnabled(false);
          toast.info("Zoom audio capture stopped");
        };
      });

      setIsZoomAudioEnabled(true);
      logger.info("Zoom window capture established");
      toast.success("Zoom audio added successfully!");

      // If currently recording, hot-swap the audio stream
      if (isRecording) {
        const micStream = (window as any).__micStream;
        const socket = (window as any).__backendSocket;
        const oldMediaRecorder = (window as any).__mediaRecorder;
        const oldStream = (window as any).__mediaStream;
        const oldAudioContext = (window as any).__audioContext;

        // Stop old MediaRecorder
        if (oldMediaRecorder && oldMediaRecorder.state !== "inactive") {
          oldMediaRecorder.stop();
        }

        // Close old audio context
        if (oldAudioContext && oldAudioContext.state !== "closed") {
          await oldAudioContext.close();
        }

        // Stop old mixed stream tracks
        if (oldStream) {
          oldStream
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
        }

        // Create new mixed stream with microphone + Zoom audio
        const audioContext = new AudioContext({ sampleRate: 48000 });
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const destination = audioContext.createMediaStreamDestination();

        // Add microphone
        const micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(destination);

        // Add Zoom audio
        const displaySource = audioContext.createMediaStreamSource(
          new MediaStream(audioTracks)
        );
        displaySource.connect(destination);

        const newStream = destination.stream;

        // Create new MediaRecorder with mixed stream
        const mediaRecorder = new MediaRecorder(newStream, {
          mimeType: "audio/webm",
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.onerror = (error) => {
          logger.error("MediaRecorder error:", error);
          setIsRecording(false);
        };

        // Start new recorder
        mediaRecorder.start(250);

        // Update global references
        (window as any).__mediaRecorder = mediaRecorder;
        (window as any).__mediaStream = newStream;
        (window as any).__displayStream = displayStream;
        (window as any).__audioContext = audioContext;

        logger.info("Hot-swapped audio to include Zoom capture");
      }
    } catch (error) {
      logger.error("Error adding Zoom audio:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add Zoom audio";

      // User cancelled or error occurred
      if (error instanceof Error && error.name === "NotAllowedError") {
        logger.info("User cancelled screen share");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const generateNote = async () => {
    if (!transcription || !appointment || !selectedVisitTypeId) {
      toast.error("Please select a visit type first");
      return;
    }

    try {
      setIsGenerating(true);

      // Step 1: Save transcription with visit_type_id and provider_notes before generating
      await apiPatch(`/transcriptions/${transcription.id}`, {
        transcription_text: transcriptionText,
        provider_notes: providerNotes,
        recording_duration_seconds: recordingElapsedTime,
        visit_type_id: selectedVisitTypeId,
      });
      logger.debug(
        "Saved transcription with visit type before generating note"
      );

      // Step 2: Fire-and-forget note generation (202 Accepted)
      // This validates subscription BEFORE creating status
      await apiPost(`/notes/generate`, {
        transcription_id: transcription.id,
        visit_type_id: selectedVisitTypeId,
      });

      // Step 3: Add transcription status "processing" (timeline log)
      // Only create status AFTER API call succeeds (subscription validated)
      logger.debug("Adding transcription status 'processing'...");
      await apiPost(
        `/transcription-status/by-transcription/${transcription.id}`,
        {
          status: "processing",
        }
      );

      logger.debug("Note generation started");

      // Show success toast - stay on page and let realtime status updates handle UI changes
      toast.success("Note generation started. This may take a moment...");
    } catch (error: unknown) {
      logger.error("Error generating note:", error);
      setIsGenerating(false);

      // Handle subscription errors
      const apiError = error as {
        status?: number;
        message?: string;
        detail?: string;
      };
      if (apiError.status === 403) {
        const errorMessage = apiError.message || apiError.detail || "";

        if (errorMessage.includes("No active subscription")) {
          setSubscriptionWarningType("no-subscription");
          setSubscriptionWarningOpen(true);
        } else if (errorMessage.includes("Monthly note limit reached")) {
          // Parse usage from error message like "Monthly note limit reached (100/100)"
          const match = errorMessage.match(/\((\d+)\/(\d+)\)/);
          if (match && match[1] && match[2]) {
            setSubscriptionUsage({
              current: parseInt(match[1]),
              limit: parseInt(match[2]),
            });
          }
          setSubscriptionWarningType("limit-exceeded");
          setSubscriptionWarningOpen(true);
        } else if (errorMessage.includes("Subscription is")) {
          setSubscriptionWarningType("inactive");
          setSubscriptionWarningOpen(true);
        }
      }
    }
  };

  // Handler for regenerating note - matches note page implementation
  const handleRegenerateNote = async () => {
    if (!transcription || !selectedVisitTypeId) {
      toast.error("Please select a visit type first");
      return;
    }

    try {
      setIsGenerating(true);

      // Step 1: Save transcription with visit_type_id and provider_notes before regenerating
      await apiPatch(`/transcriptions/${transcription.id}`, {
        transcription_text: transcriptionText,
        provider_notes: providerNotes,
        recording_duration_seconds: recordingElapsedTime,
        visit_type_id: selectedVisitTypeId,
      });
      logger.debug(
        "Saved transcription with visit type before regenerating note"
      );

      // Step 2: Call regenerate endpoint (visit_type_id is read from transcription)
      await apiPost(`/notes/generate`, {
        transcription_id: transcription.id,
        visit_type_id: selectedVisitTypeId,
      });

      // Step 3: Immediately set status to "processing" for instant UI feedback
      // The backend will also set this when the job starts, but we set it immediately
      // so the cancel button appears right away
      await apiPost(
        `/transcription-status/by-transcription/${transcription.id}`,
        {
          status: "processing",
        }
      );

      // Show success toast
      toast.success("Note regeneration started. This may take a moment...");

      // Don't reload - let realtime status updates handle the UI changes
      // The NoteActionsBar will automatically show cancel button when status becomes "processing"
    } catch (error: unknown) {
      logger.error("Error regenerating note:", error);
      setIsGenerating(false);

      const apiError = error as { message?: string; detail?: string };
      const message =
        apiError.message || apiError.detail || "Failed to regenerate note";
      toast.error(`Error: ${message}`);
    }
  };

  const handleVisitTypeChange = async (visitTypeId: string) => {
    if (!appointment) return;

    setSelectedVisitTypeId(visitTypeId);

    try {
      // Update appointment with new visit type (for local appointments)
      const updatedAppointment = await apiPatch<Appointment>(
        `/appointments/${appointmentId}`,
        { visit_type_id: visitTypeId }
      );
      setAppointment(updatedAppointment);
      logger.debug("Updated appointment visit type:", visitTypeId);

      // Also update transcription if it exists
      if (transcription) {
        await apiPatch(`/transcriptions/${transcription.id}`, {
          visit_type_id: visitTypeId,
        });
        logger.debug("Updated transcription visit type:", visitTypeId);
      }
    } catch (error) {
      logger.error("Error updating visit type:", error);
      // Revert selection on error
      if (appointment.visit_type_id) {
        setSelectedVisitTypeId(appointment.visit_type_id);
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!appointment || !patient) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-destructive mb-2">
            Appointment Not Found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            The appointment you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => router.push("/appointments")}>
            Back to Appointments
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <TranscriptionStatusProvider transcriptionIds={transcriptionIds}>
      <AppLayout>
        <CapabilitiesFetcher />
        <div>
          {/* Breadcrumb Navigation */}
          <div className="mb-4 max-w-4xl mx-auto px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={getScheduleDateUrl()}>Schedule</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Transcribe</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Patient and Appointment Cards */}
          <div className="mb-6 max-w-4xl mx-auto px-4 space-y-3">
            {appointment && patient && (
              <>
                {/* Patient Card */}
                <div className="flex justify-center">
                  <PatientCard
                    patient={{
                      id: patient.id,
                      first_name: patient.first_name,
                      last_name: patient.last_name,
                      mrn: patient.mrn ?? null,
                      date_of_birth: patient.date_of_birth ?? null,
                      gender: patient.gender ?? null,
                      phone: patient.phone ?? null,
                      email: patient.email ?? null,
                    }}
                    showAppointments={false}
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  />
                </div>

                {/* Appointment Only Card with Navigation Arrows */}
                <div className="flex items-center justify-center gap-2 w-full max-w-[650px] mx-auto">
                  {/* Previous Appointment Arrow - Only show if there's a previous appointment */}
                  {previousAppointment &&
                    !scheduleAppointmentsLoading &&
                    filtersReady &&
                    appointmentDate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePreviousAppointment}
                        className="shrink-0 h-10 w-10"
                        title={`Previous: ${previousAppointment.patient?.first_name} ${previousAppointment.patient?.last_name}`}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}

                  {/* Appointment Card */}
                  <div className="flex-1">
                    <AppointmentOnlyCard
                      appointment={(() => {
                        // Construct proper status object with transcription_id from local transcription state
                        let transcriptionStatus =
                          appointment.transcription_status ||
                          (transcription?.id
                            ? {
                                status: "not_recorded" as const,
                                transcription_id: transcription.id,
                                note_id: null,
                                error_message: null,
                                started_at: null,
                              }
                            : undefined);

                        // If we have transcription but status is missing transcription_id, add it
                        if (
                          transcriptionStatus &&
                          transcription?.id &&
                          !transcriptionStatus.transcription_id
                        ) {
                          transcriptionStatus = {
                            ...transcriptionStatus,
                            transcription_id: transcription.id,
                          };
                        }

                        const appointmentData = {
                          id: appointment.id,
                          appointment_datetime:
                            appointment.appointment_datetime,
                          ...(appointment.is_telemed !== undefined && {
                            is_telemed: appointment.is_telemed,
                          }),
                          appointment_details:
                            appointment.appointment_details ?? null,
                          connection_id: appointment.connection_id ?? null,
                          provider_name: appointment.provider_name ?? null,
                          visit_type: visitTypes.find(
                            (vt) => vt.id === selectedVisitTypeId
                          )
                            ? {
                                name: visitTypes.find(
                                  (vt) => vt.id === selectedVisitTypeId
                                )!.name,
                              }
                            : null,
                          ...(appointment.emr_settings && {
                            emr_settings: appointment.emr_settings,
                          }),
                          ...(transcriptionStatus && {
                            transcription_status: transcriptionStatus,
                          }),
                        };
                        return appointmentData;
                      })()}
                    />
                  </div>

                  {/* Next Appointment Arrow - Only show if there's a next appointment */}
                  {nextAppointment &&
                    !scheduleAppointmentsLoading &&
                    filtersReady &&
                    appointmentDate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextAppointment}
                        className="shrink-0 h-10 w-10"
                        title={`Next: ${nextAppointment.patient?.first_name} ${nextAppointment.patient?.last_name}`}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    )}
                </div>
              </>
            )}
          </div>

          {/* Visit Note Template and Generate Note Button - Always visible */}
          {transcription && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-4 gap-3 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <label
                  htmlFor="visit-type-select"
                  className="text-sm font-medium text-muted-foreground whitespace-nowrap"
                >
                  Visit Note Template:
                </label>
                <Select
                  value={selectedVisitTypeId}
                  onValueChange={handleVisitTypeChange}
                  disabled={visitTypesLoading || isGenerating}
                >
                  <SelectTrigger
                    id="visit-type-select"
                    className="w-[140px] sm:w-[240px]"
                  >
                    <SelectValue placeholder="Select visit type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypes.map((visitType) => (
                      <SelectItem key={visitType.id} value={visitType.id}>
                        {visitType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons - Right aligned, shows full menu after recording */}
              <div className="flex justify-end">
                <TranscribeActionBar
                  transcriptionId={transcription?.id || null}
                  appointmentId={appointmentId}
                  visitTypeId={selectedVisitTypeId}
                  onGenerate={generateNote}
                  onRegenerate={handleRegenerateNote}
                  onViewNote={() =>
                    router.push(`/appointments/${appointmentId}/note`)
                  }
                  canGenerate={!!appointment && !!selectedVisitTypeId}
                />
              </div>
            </div>
          )}

          {/* Tabs for section switching */}
          <Tabs
            value={activeSection}
            onValueChange={(v) => setActiveSection(v as SidebarSection)}
            className="mb-6 max-w-4xl mx-auto px-4"
          >
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6 overflow-x-auto scrollbar-hide">
              <TabsTrigger
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <StickyNote className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">
                  Additional Context
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <UserIcon className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Patient Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                disabled={pastNotes.length === 0}
              >
                <Sparkles className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger
                value="past-notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <FileText className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Past Notes</span>
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Calendar className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger
                value="vitals"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Activity className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Vitals</span>
              </TabsTrigger>
              <TabsTrigger
                value="providers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Stethoscope className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Providers</span>
              </TabsTrigger>
            </TabsList>

            {/* Additional Context Section */}
            <TabsContent value="notes">
              <div className="mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-foreground">
                  Additional Context
                </h2>

                <textarea
                  className="w-full p-3 sm:p-4 border rounded-md bg-background text-foreground text-sm resize-none mb-4"
                  style={{ minHeight: "200px", height: "300px" }}
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  placeholder="Provide any notes, details from the patient's history, or other context that will help the AI generate more accurate and personalized documentation."
                  disabled={isGenerating}
                />

                {/* Error message */}
                {transcription && (!appointment || !selectedVisitTypeId) && (
                  <p className="text-sm text-destructive text-right">
                    Please select a visit type for this appointment before
                    generating a note
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Patient Details Section */}
            <TabsContent value="details">
              {patient ? (
                <PatientDetailsTabContent
                  formData={patientFormData}
                  onFormDataChange={(data) =>
                    setPatientFormData({ ...patientFormData, ...data })
                  }
                  onSave={handleSavePatient}
                  onInactivate={handleInactivatePatient}
                  saving={savingPatient}
                  error={patientError}
                />
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>

            {/* Past Notes Section */}
            <TabsContent value="past-notes">
              <div className="mb-6 max-w-4xl mx-auto px-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-center">
                  Past Notes
                </h2>
                {pastNotesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : pastNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">
                    No past notes found for this patient.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pastNotes.map((note) => (
                      <div key={note.id} className="flex justify-center">
                        <NoteCard
                          note={note}
                          onClick={() => setSelectedPastNote(note)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Summary Section */}
            <TabsContent value="summary">
              <div className="mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-foreground">
                  AI Summary
                </h2>
                {summaryLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : summary ? (
                  <Card>
                    <CardContent className="p-4">
                      <MarkdownRenderer content={summary} className="text-sm" />
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-sm text-muted-foreground py-8">
                    No summary available.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Appointments Section */}
            <TabsContent value="appointments">
              <div className="mb-6 max-w-4xl mx-auto px-4">
                {appointmentsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upcoming Appointments */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-center">
                        Upcoming Appointments
                      </h3>
                      {patientAppointments.filter(
                        (apt) =>
                          new Date(apt.appointment_datetime) >= new Date()
                      ).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3">
                          No upcoming appointments
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {patientAppointments
                            .filter(
                              (apt) =>
                                new Date(apt.appointment_datetime) >= new Date()
                            )
                            .sort(
                              (a, b) =>
                                new Date(a.appointment_datetime).getTime() -
                                new Date(b.appointment_datetime).getTime()
                            )
                            .map((apt) => {
                              // Parse appointment_details to extract status and reason
                              let status: string | undefined;
                              let reason = apt.appointment_details || null;

                              if (apt.appointment_details?.includes("|")) {
                                const parts = apt.appointment_details
                                  .split("|")
                                  .map((p) => p.trim());
                                status = parts[0] || undefined;
                                reason = parts.slice(1).join(" | ") || null;
                              }

                              return (
                                <div
                                  key={apt.id}
                                  className="flex justify-center"
                                >
                                  <AppointmentOnlyCard
                                    appointment={{
                                      id: apt.id,
                                      appointment_datetime:
                                        apt.appointment_datetime,
                                      ...(apt.is_telemed !== undefined && {
                                        is_telemed: apt.is_telemed,
                                      }),
                                      appointment_details: reason,
                                      connection_id: apt.connection_id ?? null,
                                      provider_name: apt.provider_name ?? null,
                                      visit_type: apt.visit_type ?? null,
                                      emr_settings: {
                                        ...apt.emr_settings,
                                        ...(status && {
                                          appointment_status: status,
                                        }),
                                        ...(reason && {
                                          reason_for_appointment: reason,
                                        }),
                                      },
                                    }}
                                    onClick={() =>
                                      router.push(
                                        `/appointments/${apt.id}/transcribe`
                                      )
                                    }
                                  />
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Past Appointments */}
                    <div className="space-y-3 mt-6">
                      <h3 className="text-sm font-semibold text-center">
                        Past Appointments
                      </h3>
                      {patientAppointments.filter(
                        (apt) => new Date(apt.appointment_datetime) < new Date()
                      ).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3">
                          No past appointments
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {patientAppointments
                            .filter(
                              (apt) =>
                                new Date(apt.appointment_datetime) < new Date()
                            )
                            .sort(
                              (a, b) =>
                                new Date(b.appointment_datetime).getTime() -
                                new Date(a.appointment_datetime).getTime()
                            )
                            .slice(0, 10)
                            .map((apt) => {
                              // Parse appointment_details to extract status and reason
                              let status: string | undefined;
                              let reason = apt.appointment_details || null;

                              if (apt.appointment_details?.includes("|")) {
                                const parts = apt.appointment_details
                                  .split("|")
                                  .map((p) => p.trim());
                                status = parts[0] || undefined;
                                reason = parts.slice(1).join(" | ") || null;
                              }

                              return (
                                <div
                                  key={apt.id}
                                  className="flex justify-center"
                                >
                                  <AppointmentOnlyCard
                                    appointment={{
                                      id: apt.id,
                                      appointment_datetime:
                                        apt.appointment_datetime,
                                      ...(apt.is_telemed !== undefined && {
                                        is_telemed: apt.is_telemed,
                                      }),
                                      appointment_details: reason,
                                      connection_id: apt.connection_id ?? null,
                                      provider_name: apt.provider_name ?? null,
                                      visit_type: apt.visit_type ?? null,
                                      emr_settings: {
                                        ...apt.emr_settings,
                                        ...(status && {
                                          appointment_status: status,
                                        }),
                                        ...(reason && {
                                          reason_for_appointment: reason,
                                        }),
                                      },
                                    }}
                                    onClick={() =>
                                      router.push(
                                        `/appointments/${apt.id}/transcribe`
                                      )
                                    }
                                  />
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Vitals Section */}
            <TabsContent value="vitals">
              <div className="mb-6 max-w-4xl mx-auto">
                <VitalsSection
                  appointmentId={appointmentId}
                  patientId={patient?.id || ""}
                  isReadOnly={appointment?.connection_id !== null}
                  vitals={vitals}
                  vitalDefinitions={vitalDefinitions}
                  loading={vitalsLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="providers">
              <div className="mb-6 max-w-4xl mx-auto">
                <ProvidersTabContent
                  patientId={patient?.id || ""}
                  initialProviders={providers}
                  onUpdate={handleProvidersUpdate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Subscription Warning Dialog */}
        <SubscriptionWarningDialog
          open={subscriptionWarningOpen}
          onOpenChange={setSubscriptionWarningOpen}
          type={subscriptionWarningType}
          usage={subscriptionUsage}
        />

        {/* Collapsible Transcription Sidebar */}
        {sidebarOpen ? (
          <div className="fixed right-0 top-16 bottom-0 overflow-hidden bg-card border-l border-border shadow-lg transition-all duration-300 z-40 flex flex-col w-full sm:w-96">
            {/* Sidebar Toggle Tab */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between border-b flex-shrink-0">
                <div className="flex items-center justify-between w-full p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        isRecording ? stopRecording() : startRecording()
                      }
                      disabled={isGenerating}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 hover:opacity-80 transition-all ${
                        isRecording
                          ? "text-green-600 border-green-600 bg-green-50"
                          : "text-red-600 border-red-600 bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      <Mic
                        className={`h-5 w-5 ${
                          isRecording ? "animate-pulse" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() =>
                        isRecording ? stopRecording() : startRecording()
                      }
                      disabled={isGenerating}
                      className={`font-mono text-lg font-semibold tracking-wide hover:opacity-80 transition-opacity cursor-pointer ${
                        isRecording ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatRecordingTime(recordingElapsedTime)}
                    </button>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="hover:bg-muted p-1.5 rounded transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b flex-shrink-0">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">
                    Transcription
                  </h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          disabled={isGenerating}
                          size="sm"
                          className="flex-1"
                          data-testid="start-recording-button"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Record
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          data-testid="stop-recording-button"
                        >
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={addZoomAudio}
                      disabled={isGenerating || isZoomAudioEnabled}
                      size="sm"
                      variant={isZoomAudioEnabled ? "outline" : "secondary"}
                      className={`w-full ${
                        isZoomAudioEnabled
                          ? "bg-green-50 border-green-600 text-green-700"
                          : ""
                      }`}
                    >
                      {isZoomAudioEnabled
                        ? "📹 Zoom Audio ON"
                        : "📹 Add Zoom Audio"}
                    </Button>
                  </div>
                </div>

                <div className="p-4 flex-1 min-h-0 flex flex-col">
                  <textarea
                    ref={transcriptionTextareaRef}
                    className="w-full flex-1 p-4 border rounded-md bg-background text-foreground text-sm resize-none"
                    value={transcriptionText}
                    onChange={(e) => setTranscriptionText(e.target.value)}
                    placeholder="Transcription will appear here..."
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed state - horizontal bar at top right */
          <div className="fixed right-0 top-16 z-40 flex items-center gap-2 bg-card border-l border-b border-border shadow-lg pl-3 py-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-muted p-1.5 rounded transition-colors"
              title="Open transcription panel"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              disabled={isGenerating}
              className={`flex items-center justify-center w-9 h-9 rounded-full border-2 hover:opacity-80 transition-all ${
                isRecording
                  ? "text-green-600 border-green-600 bg-green-50"
                  : "text-red-600 border-red-600 bg-red-50 hover:bg-red-100"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              <Mic
                className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`}
              />
            </button>
            <button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              disabled={isGenerating}
              className={`font-mono text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity cursor-pointer ${
                isRecording ? "text-green-600" : "text-red-600"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {formatRecordingTime(recordingElapsedTime)}
            </button>
            <button
              onClick={addZoomAudio}
              disabled={isGenerating || isZoomAudioEnabled}
              className={`text-xs px-2 py-1 rounded border transition-all mr-2 ${
                isZoomAudioEnabled
                  ? "bg-green-50 border-green-600 text-green-700"
                  : "bg-blue-50 border-blue-600 text-blue-700 hover:bg-blue-100"
              }`}
              title={
                isZoomAudioEnabled ? "Zoom audio enabled" : "Add Zoom audio"
              }
            >
              {isZoomAudioEnabled ? "📹 Zoom ON" : "📹 Add Zoom"}
            </button>
          </div>
        )}

        {/* Past Note Detail Dialog */}
        <PastNotesDialog
          note={selectedPastNote}
          isOpen={!!selectedPastNote}
          onClose={() => setSelectedPastNote(null)}
          showCloseButton={true}
        />
      </AppLayout>
    </TranscriptionStatusProvider>
  );
}
