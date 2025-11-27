"use client";

import { AppLayout } from "@/components/AppLayout";
import { AppointmentCard } from "@/components/AppointmentCard";
import { CapabilitiesFetcher } from "@/components/CapabilitiesFetcher";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptionStatusProvider } from "@/contexts/TranscriptionStatusContext";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { CAPABILITIES, useCapabilities } from "@/lib/capabilities";
import { createClient } from "@/lib/supabase/client";
import { getAppointmentsKey, useAppointments } from "@/lib/use-appointments";
import { useLocations, useProviders } from "@/lib/use-providers";
import type { User as AuthUser } from "@supabase/supabase-js";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  List,
  Loader2,
  MapPin,
  Plus,
  Users,
  Video,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { mutate } from "swr";

import { logger } from "@/lib/logger";
// New view model interface matching backend AppointmentListItemViewModel
interface AppointmentViewModel {
  id: string;
  appointment_datetime: string;
  duration_minutes: number;
  status: string;
  appointment_details?: string | null;
  provider_id?: string;
  location_id?: string | null;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    mrn?: string | null;
    full_name?: string | null; // For EMRs that return combined name (e.g., Charm)
  };
  visit_type?: {
    id: string | null; // null = unmapped EMR visit type
    name: string;
  } | null;
  transcription_status?: {
    status:
      | "not_recorded"
      | "recording"
      | "recorded"
      | "processing"
      | "completed"
      | "failed"
      | "pushed_to_emr"
      | "signed";
    transcription_id?: string | null;
    note_id?: string | null;
    error_message?: string | null;
    started_at?: string | null;
  };
}

// Keep Patient interface for the create/edit modal
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  mrn?: string;
  date_of_birth?: string;
}

interface VisitType {
  id: string;
  name: string;
  is_default?: boolean;
}

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
}

interface Location {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
}

type ViewMode = "list" | "day" | "week" | "month";

function AppointmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const capabilities = useCapabilities();
  // Initialize from sessionStorage or default to today
  // Use lazy initialization to avoid race condition with save useEffect
  // sessionStorage ensures date resets to "today" on new browser tab/session
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("appointmentsDate");
      if (stored) {
        try {
          const match = stored.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            const [, year = "", month = "", day = ""] = match;
            const parsedDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
        } catch {
          // Fall through to default
        }
      }
    }
    // Normalize to local midnight to prevent timezone issues
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [patientsList, setPatientsList] = useState<Patient[]>([]); // For create/edit modal
  const [visitTypesList, setVisitTypesList] = useState<VisitType[]>([]); // For create/edit modal
  const [user, setUser] = useState<AuthUser | null>(null);

  // Use SWR hooks for providers/locations (cached for 60 minutes)
  const { data: providers = [] } = useProviders();
  const { data: locations = [] } = useLocations();

  // Filter state managed with React useState and persisted to sessionStorage
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [providerFilterOpen, setProviderFilterOpen] = useState(false);
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // View mode state
  const [activeView, setActiveView] = useState<ViewMode>("list");

  // Track filter changes to show loading indicator only when filters change
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const prevProviderIdsRef = useRef<string[]>([]);
  const prevLocationIdsRef = useRef<string[]>([]);

  // Use SWR hook for appointments with caching
  // Server-side filtering by provider and location
  // Note: Hook suspends fetching internally until filters are initialized
  const {
    data: appointments,
    isLoading: loading,
    isValidating,
    error: appointmentsError,
    mutate: refreshAppointments,
  } = useAppointments(currentDate, selectedProviderIds, selectedLocationIds);

  // Check if filters are ready for UI display logic
  const filtersReady =
    selectedProviderIds.length > 0 && selectedLocationIds.length > 0;

  // Extract transcription IDs for status subscription
  const transcriptionIds = useMemo(() => {
    return (appointments || [])
      .map((appt) => appt.transcription_status?.transcription_id)
      .filter((id): id is string => !!id);
  }, [appointments]);

  // Detect filter changes and show loading indicator only for filter changes (not date changes)
  useEffect(() => {
    // Check if provider or location filters changed
    const providerIdsChanged =
      JSON.stringify(prevProviderIdsRef.current.sort()) !==
      JSON.stringify([...selectedProviderIds].sort());
    const locationIdsChanged =
      JSON.stringify(prevLocationIdsRef.current.sort()) !==
      JSON.stringify([...selectedLocationIds].sort());

    // Only show loading if filters actually changed (not on initial mount)
    if (
      (providerIdsChanged || locationIdsChanged) &&
      prevProviderIdsRef.current.length > 0
    ) {
      setIsFilterLoading(true);
    }

    // Update refs for next comparison
    prevProviderIdsRef.current = selectedProviderIds;
    prevLocationIdsRef.current = selectedLocationIds;
  }, [selectedProviderIds, selectedLocationIds]);

  // Hide loading indicator when validation completes
  useEffect(() => {
    if (!isValidating && isFilterLoading) {
      setIsFilterLoading(false);
    }
  }, [isValidating, isFilterLoading]);

  // New Appointment Modal State
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentViewModel | null>(null);
  const [deletingAppointment, setDeletingAppointment] =
    useState<AppointmentViewModel | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedVisitTypeId, setSelectedVisitTypeId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isTelemed, setIsTelemed] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Quick Add Patient State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newPatientFirstName, setNewPatientFirstName] = useState("");
  const [newPatientLastName, setNewPatientLastName] = useState("");
  const [newPatientDOB, setNewPatientDOB] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("");
  const [newPatientMRN, setNewPatientMRN] = useState("");
  const [addingPatient, setAddingPatient] = useState(false);

  // No Visit Types Modal State
  const [showNoVisitTypesModal, setShowNoVisitTypesModal] = useState(false);

  // Set mounted state on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Save date to sessionStorage whenever it changes (store as YYYY-MM-DD to avoid timezone issues)
  useEffect(() => {
    if (currentDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      sessionStorage.setItem("appointmentsDate", dateStr);
    }
  }, [currentDate]);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    if (selectedProviderIds.length > 0 || selectedLocationIds.length > 0) {
      sessionStorage.setItem(
        "appointmentFilters",
        JSON.stringify({
          providerIds: selectedProviderIds,
          locationIds: selectedLocationIds,
        })
      );
    }
  }, [selectedProviderIds, selectedLocationIds]);

  // Track if filters have been initialized to prevent multiple initializations
  const filtersInitializedRef = useRef(false);

  // Initialize filters with defaults (only on first load when no saved filters exist)
  useEffect(() => {
    // Skip if already initialized
    if (filtersInitializedRef.current) return;

    // Wait for data to load
    if (providers.length === 0 || locations.length === 0 || !user) return;

    // Skip if filters already exist in sessionStorage
    const stored = sessionStorage.getItem("appointmentFilters");
    if (
      stored &&
      (selectedProviderIds.length > 0 || selectedLocationIds.length > 0)
    ) {
      filtersInitializedRef.current = true;
      return;
    }

    // Provider default: current user if provider, else all providers
    const defaultProviderIds = providers.some((p) => p.id === user.id)
      ? [user.id]
      : providers.map((p) => p.id);

    // Location default: ALL locations
    const defaultLocationIds = locations.map((l) => l.id);

    setSelectedProviderIds(defaultProviderIds);
    setSelectedLocationIds(defaultLocationIds);

    filtersInitializedRef.current = true;
  }, [providers, locations, user, selectedProviderIds, selectedLocationIds]);

  // Restore scroll position on mount and save on unmount
  useEffect(() => {
    // Restore scroll position after a short delay to ensure content is rendered
    const restoreScroll = () => {
      const savedScrollPos = sessionStorage.getItem("appointmentsScrollPos");
      if (savedScrollPos) {
        const scrollY = parseInt(savedScrollPos, 10);
        if (!isNaN(scrollY)) {
          // Use setTimeout to ensure DOM is ready
          setTimeout(() => {
            window.scrollTo({
              top: scrollY,
              behavior: "instant", // Instant to avoid visible scrolling
            });
          }, 100);
        }
      }
    };

    restoreScroll();

    // Save scroll position before navigating away
    const handleScroll = () => {
      sessionStorage.setItem(
        "appointmentsScrollPos",
        window.scrollY.toString()
      );
    };

    // Save on scroll (debounced via passive listener)
    let scrollTimeout: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });

    // Save on unmount (when navigating away)
    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(scrollTimeout);
      handleScroll(); // Final save
    };
  }, []);

  // Fetch patients and visit types for create/edit modal (once on mount)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch patients list for create/edit modal
        const patientsData = await apiGet<{ patients: Patient[] }>(`/patients`);
        setPatientsList(patientsData.patients);

        // Fetch visit types list for create/edit modal
        const visitTypesData = await apiGet<VisitType[]>(`/visit-types`);
        setVisitTypesList(visitTypesData);

        // Check if no visit types exist
        if (visitTypesData.length === 0) {
          setShowNoVisitTypesModal(true);
        }
      } catch (error) {
        logger.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  // Normalize date to local midnight (prevents timezone cache bugs)
  const normalizeDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Add days to a date (normalized to local midnight)
  const addDays = (date: Date, days: number): Date => {
    const normalized = normalizeDate(date);
    const result = new Date(normalized);
    result.setDate(result.getDate() + days);
    return normalizeDate(result);
  };

  // Invalidate cache for current date and ±2 days after CRUD operations
  const invalidateAppointmentsCache = async () => {
    const datesToInvalidate = [
      currentDate,
      addDays(currentDate, 1),
      addDays(currentDate, -1),
      addDays(currentDate, 2),
      addDays(currentDate, -2),
    ];

    // Invalidate cache for each date
    for (const date of datesToInvalidate) {
      const key = getAppointmentsKey(
        date,
        selectedProviderIds,
        selectedLocationIds
      );
      await mutate(key);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(normalizeDate(newDate));
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(normalizeDate(newDate));
  };

  const goToToday = () => {
    setCurrentDate(normalizeDate(new Date()));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // No client-side filtering needed - server-side filtering is now handled by the API
  // The appointments from useAppointments are already filtered by provider_ids and location_ids
  const filteredAppointments = appointments || [];

  const toggleProviderSelection = (providerId: string) => {
    const newProviderIds = selectedProviderIds.includes(providerId)
      ? selectedProviderIds.filter((id) => id !== providerId)
      : [...selectedProviderIds, providerId];
    setSelectedProviderIds(newProviderIds);
  };

  const selectAllProviders = () => {
    setSelectedProviderIds(providers.map((p) => p.id));
  };

  const deselectAllProviders = () => {
    setSelectedProviderIds([]);
  };

  const toggleLocationSelection = (locationId: string) => {
    const newLocationIds = selectedLocationIds.includes(locationId)
      ? selectedLocationIds.filter((id) => id !== locationId)
      : [...selectedLocationIds, locationId];
    setSelectedLocationIds(newLocationIds);
  };

  const selectAllLocations = () => {
    setSelectedLocationIds(locations.map((l) => l.id));
  };

  const deselectAllLocations = () => {
    setSelectedLocationIds([]);
  };

  const openNewAppointmentModal = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0] ?? "";
    const timeStr = now.toTimeString().slice(0, 5); // HH:MM format

    // Find default visit type
    const defaultVisitType = visitTypesList.find((vt) => vt.is_default);
    // Use first location as default, or first filtered location if filters are active
    const defaultLocation =
      selectedLocationIds.length > 0
        ? locations.find((loc) => selectedLocationIds.includes(loc.id))
        : locations[0];

    setEditingAppointment(null);
    setAppointmentDate(dateStr);
    setAppointmentTime(timeStr);
    setSelectedPatientId("");
    setPatientSearch("");
    setSelectedVisitTypeId(defaultVisitType?.id || "");
    setSelectedLocationId(defaultLocation?.id || "");
    setAppointmentNotes("");
    setError("");
    setShowQuickAdd(false);
    setShowNewAppointmentModal(true);
  };

  const openEditAppointmentModal = (appointment: AppointmentViewModel) => {
    const patient = appointment.patient;
    const appointmentDateTime = new Date(appointment.appointment_datetime);
    const dateStr = appointmentDateTime.toISOString().split("T")[0] ?? "";
    const timeStr = appointmentDateTime.toTimeString().slice(0, 5);

    setEditingAppointment(appointment);
    setAppointmentDate(dateStr);
    setAppointmentTime(timeStr);
    setSelectedPatientId(patient.id);
    setPatientSearch(
      patient
        ? `${patient.first_name} ${patient.last_name}${
            patient.mrn ? ` (${patient.mrn})` : ""
          }`
        : ""
    );
    setSelectedVisitTypeId(appointment.visit_type?.id || "");
    setSelectedLocationId(appointment.location_id || "");
    setAppointmentNotes(appointment.appointment_details || "");
    setError("");
    setShowQuickAdd(false);
    setShowNewAppointmentModal(true);
  };

  const handleDeleteAppointment = async () => {
    if (!deletingAppointment) return;

    setCreating(true);
    setError("");

    try {
      await apiDelete(`/appointments/${deletingAppointment.id}`);

      // Invalidate cache for current date and ±2 days
      await invalidateAppointmentsCache();
      setDeletingAppointment(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete appointment";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    if (!selectedPatientId) {
      setError("Please select a patient");
      setCreating(false);
      return;
    }

    if (!selectedVisitTypeId) {
      setError("Please select a visit type");
      setCreating(false);
      return;
    }

    if (!user) {
      setError("User not found");
      setCreating(false);
      return;
    }

    try {
      // Create datetime in user's local timezone, then convert to ISO string (UTC)
      const localDateTime = new Date(
        `${appointmentDate}T${appointmentTime}:00`
      );
      const appointmentDatetime = localDateTime.toISOString();

      const payload = {
        patient_id: selectedPatientId,
        provider_id: user.id,
        appointment_datetime: appointmentDatetime,
        location_id: selectedLocationId,
        visit_type_id: selectedVisitTypeId,
        notes: appointmentNotes || null,
        is_telemed: isTelemed,
        resource_name: resourceName || null,
      };

      if (editingAppointment) {
        // Update existing appointment
        await apiPatch(`/appointments/${editingAppointment.id}`, payload);
      } else {
        // Create new appointment
        await apiPost("/appointments", payload);
      }

      setShowNewAppointmentModal(false);
      setEditingAppointment(null);

      // Invalidate cache for current date and ±2 days
      await invalidateAppointmentsCache();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${editingAppointment ? "update" : "create"} appointment`;
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const filteredPatients = patientsList.filter((patient) => {
    const searchLower = patientSearch.toLowerCase().trim();

    // If empty search, return nothing
    if (!searchLower) return false;

    // Extract MRN from parentheses if present (e.g., "Mariah Payan (POC23571)" -> "POC23571")
    const mrnMatch = searchLower.match(/\(([^)]+)\)/);
    if (
      mrnMatch &&
      mrnMatch[1] &&
      patient.mrn &&
      patient.mrn.toLowerCase().includes(mrnMatch[1])
    ) {
      return true;
    }

    // Remove MRN from search string for name matching
    const searchWithoutMRN = searchLower
      .replace(/\s*\([^)]+\)\s*/g, " ")
      .trim();

    // Check MRN first (exact match takes priority)
    if (patient.mrn && patient.mrn.toLowerCase().includes(searchWithoutMRN)) {
      return true;
    }

    // Split search into words for multi-word search
    const searchWords = searchWithoutMRN
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // If single word, search in both first and last name
    if (searchWords.length === 1 && searchWords[0]) {
      return (
        patient.first_name.toLowerCase().includes(searchWords[0]) ||
        patient.last_name.toLowerCase().includes(searchWords[0])
      );
    }

    // For multiple words, check if all words appear in name fields
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return searchWords.every((word) => word && fullName.includes(word));
  });

  // Parse flexible date formats (7/28/1972, 7/28/72, 07/28/1972)
  const parseDateOfBirth = (dateStr: string): string | null => {
    if (!dateStr) return null;

    // Remove any whitespace
    const cleaned = dateStr.trim();

    // Try to parse M/D/YY or M/D/YYYY format
    const parts = cleaned.split("/");
    if (parts.length !== 3) return null;

    let month = parts[0];
    let day = parts[1];
    let year = parts[2];

    // Validate we have all parts
    if (!month || !day || !year) return null;

    // Pad month and day with leading zeros if needed
    month = month.padStart(2, "0");
    day = day.padStart(2, "0");

    // Handle 2-digit years
    if (year.length === 2) {
      const yearNum = parseInt(year);
      // If year is > 25, assume 1900s, otherwise 2000s
      year = yearNum > 25 ? `19${year}` : `20${year}`;
    }

    // Validate the parsed date
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) return null;

    return `${year}-${month}-${day}`;
  };

  const handleAddPatient = async () => {
    setError("");
    setAddingPatient(true);

    if (!newPatientFirstName || !newPatientLastName) {
      setError("First name and last name are required");
      setAddingPatient(false);
      return;
    }

    try {
      const parsedDOB = newPatientDOB ? parseDateOfBirth(newPatientDOB) : null;

      const newPatient = await apiPost<Patient>("/patients", {
        first_name: newPatientFirstName,
        last_name: newPatientLastName,
        date_of_birth: parsedDOB,
        gender: newPatientGender || null,
        mrn: newPatientMRN || null,
      });

      // Add to patients list
      setPatientsList([...patientsList, newPatient]);

      // Select the new patient
      setSelectedPatientId(newPatient.id);
      setPatientSearch(
        `${newPatient.first_name} ${newPatient.last_name}${
          newPatient.mrn ? ` (${newPatient.mrn})` : ""
        }`
      );

      // Reset quick add form
      setNewPatientFirstName("");
      setNewPatientLastName("");
      setNewPatientDOB("");
      setNewPatientGender("");
      setNewPatientMRN("");
      setShowQuickAdd(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add patient";
      setError(message);
    } finally {
      setAddingPatient(false);
    }
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <TranscriptionStatusProvider transcriptionIds={transcriptionIds}>
      <AppLayout>
        {/* Tabbed Navigation */}
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as ViewMode)}
        >
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
            <TabsTrigger
              value="list"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <List className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">List View</span>
            </TabsTrigger>
            <TabsTrigger
              value="day"
              disabled
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Calendar className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Day View</span>
            </TabsTrigger>
            <TabsTrigger
              value="week"
              disabled
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Week View</span>
            </TabsTrigger>
            <TabsTrigger
              value="month"
              disabled
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <CalendarRange className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Month View</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeView}>
            <div className="max-w-4xl mx-auto">
              {/* Header with Filters and Date Selector */}
              <div className="mb-4">
                {/* First Row: Date Navigation */}
                <div className="flex items-center justify-center mb-2">
                  <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2 w-full max-w-md">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousDay}
                      className="w-10 h-10 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-sm sm:text-base font-semibold hover:bg-muted hover:text-muted-foreground justify-center w-full"
                          data-testid="date-picker-button"
                        >
                          {mounted ? formatDate(currentDate) : "Loading..."}
                          <Calendar className="h-4 w-4 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <CalendarComponent
                          mode="single"
                          selected={currentDate}
                          onSelect={(date) => {
                            if (date) {
                              setCurrentDate(normalizeDate(date));
                              setCalendarOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextDay}
                      className="w-10 h-10 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Second Row: Filters and New Appointment Button */}
                <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                  {/* Filters and Today Button */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Provider Filter */}
                    {mounted && providers.length > 1 && (
                      <Popover
                        open={providerFilterOpen}
                        onOpenChange={setProviderFilterOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Providers
                            {selectedProviderIds.length > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                                {selectedProviderIds.length}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">
                                Filter by Provider
                              </h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={selectAllProviders}
                                >
                                  All
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={deselectAllProviders}
                                >
                                  None
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {providers.map((provider) => (
                                <div
                                  key={provider.id}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
                                  onClick={() =>
                                    toggleProviderSelection(provider.id)
                                  }
                                >
                                  <Checkbox
                                    id={`provider-${provider.id}`}
                                    checked={selectedProviderIds.includes(
                                      provider.id
                                    )}
                                    onCheckedChange={() =>
                                      toggleProviderSelection(provider.id)
                                    }
                                  />
                                  <label
                                    htmlFor={`provider-${provider.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {provider.first_name} {provider.last_name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Location Filter */}
                    {mounted && locations.length > 0 && (
                      <Popover
                        open={locationFilterOpen}
                        onOpenChange={setLocationFilterOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            Locations
                            {selectedLocationIds.length > 0 &&
                              selectedLocationIds.length < locations.length && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                                  {selectedLocationIds.length}
                                </span>
                              )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">
                                Filter by Location
                              </h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={selectAllLocations}
                                >
                                  All
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={deselectAllLocations}
                                >
                                  None
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {locations.map((location) => (
                                <div
                                  key={location.id}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
                                  onClick={() =>
                                    toggleLocationSelection(location.id)
                                  }
                                >
                                  <Checkbox
                                    id={`location-${location.id}`}
                                    checked={selectedLocationIds.includes(
                                      location.id
                                    )}
                                    onCheckedChange={() =>
                                      toggleLocationSelection(location.id)
                                    }
                                  />
                                  <label
                                    htmlFor={`location-${location.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {location.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Loading indicator when filters change (not for date changes or background prefetch) */}
                    {isFilterLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">
                          Loading appointments...
                        </span>
                      </div>
                    )}

                    {/* Today Button */}
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Today
                    </Button>
                  </div>

                  {/* New Appointment Button */}
                  {capabilities.has(CAPABILITIES.CREATE_APPOINTMENT) && (
                    <Button
                      size="sm"
                      onClick={openNewAppointmentModal}
                      data-testid="new-appointment-button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Appointment</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {mounted && appointmentsError && (
                <div className="rounded-md bg-destructive/10 p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-destructive font-medium">
                      Error loading appointments:
                    </span>
                    <span className="text-destructive">
                      {appointmentsError?.message || String(appointmentsError)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshAppointments()}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Appointments List */}
              {!mounted || loading || !filtersReady ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Loading appointments...
                  </p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    {/* Calendar Icon with X */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xl font-bold">
                            ×
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3">
                      No appointments found
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {selectedProviderIds.length > 0 ||
                      (selectedLocationIds.length > 0 &&
                        selectedLocationIds.length < locations.length)
                        ? `There are no appointments matching your filters for ${formatDate(
                            currentDate
                          )}. Try adjusting your provider/location filters or use the "New Appointment" button to schedule one.`
                        : `There are no appointments for ${formatDate(
                            currentDate
                          )}. Try adjusting the date or use the "New Appointment" button to schedule one.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  {filteredAppointments
                    .sort(
                      (a, b) =>
                        new Date(a.appointment_datetime).getTime() -
                        new Date(b.appointment_datetime).getTime()
                    )
                    .map((appointment) => {
                      // Patient and visit_type are now pre-joined in the view model
                      const patient = appointment.patient;

                      // Build props object with proper typing (excluding key)
                      const cardProps: {
                        appointment: typeof appointment;
                        onClick: () => void;
                        show_edit_delete?: boolean;
                        onEdit?: () => void;
                        onDelete?: () => void;
                      } = {
                        appointment,
                        onClick: () => {
                          // Date is already stored in localStorage via useEffect
                          window.location.href = `/appointments/${appointment.id}/transcribe`;
                        },
                      };

                      // Add edit/delete handlers if user has permissions
                      if (
                        capabilities.has(CAPABILITIES.UPDATE_APPOINTMENT) ||
                        capabilities.has(CAPABILITIES.DELETE_APPOINTMENT)
                      ) {
                        cardProps.show_edit_delete = true;

                        if (capabilities.has(CAPABILITIES.UPDATE_APPOINTMENT)) {
                          cardProps.onEdit = () =>
                            openEditAppointmentModal(appointment);
                        }

                        if (capabilities.has(CAPABILITIES.DELETE_APPOINTMENT)) {
                          cardProps.onDelete = () =>
                            setDeletingAppointment(appointment);
                        }
                      }

                      // Pass key directly to JSX, not via spread
                      return (
                        <AppointmentCard key={appointment.id} {...cardProps} />
                      );
                    })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* New/Edit Appointment Modal */}
        <Dialog
          open={showNewAppointmentModal}
          onOpenChange={(open) => {
            setShowNewAppointmentModal(open);
            if (!open) setEditingAppointment(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Edit Appointment" : "New Appointment"}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? "Update appointment details"
                  : "Create a new appointment for a patient"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientSearch">Patient</Label>
                  <div className="flex gap-2">
                    <Input
                      id="patientSearch"
                      type="text"
                      placeholder="Search by name or MRN..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        // Clear selected patient when user types
                        setSelectedPatientId("");
                      }}
                      className="flex-1"
                    />
                    {capabilities.has(CAPABILITIES.CREATE_PATIENT) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Quick Add Patient Form */}
                  {showQuickAdd && (
                    <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                      <p className="text-sm font-medium">Quick Add Patient</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="newFirstName" className="text-xs">
                            First Name *
                          </Label>
                          <Input
                            id="newFirstName"
                            type="text"
                            value={newPatientFirstName}
                            onChange={(e) =>
                              setNewPatientFirstName(e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newLastName" className="text-xs">
                            Last Name *
                          </Label>
                          <Input
                            id="newLastName"
                            type="text"
                            value={newPatientLastName}
                            onChange={(e) =>
                              setNewPatientLastName(e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="newDOB" className="text-xs">
                            Date of Birth
                          </Label>
                          <Input
                            id="newDOB"
                            type="text"
                            placeholder="M/D/YYYY"
                            value={newPatientDOB}
                            onChange={(e) => setNewPatientDOB(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newGender" className="text-xs">
                            Gender
                          </Label>
                          <select
                            id="newGender"
                            value={newPatientGender}
                            onChange={(e) =>
                              setNewPatientGender(e.target.value)
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newMRN" className="text-xs">
                          MRN
                        </Label>
                        <Input
                          id="newMRN"
                          type="text"
                          value={newPatientMRN}
                          onChange={(e) => setNewPatientMRN(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddPatient}
                        disabled={addingPatient}
                        className="w-full"
                      >
                        {addingPatient ? "Adding..." : "Add Patient"}
                      </Button>
                    </div>
                  )}

                  {patientSearch && !showQuickAdd && !selectedPatientId && (
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      {filteredPatients.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">
                          No patients found
                        </p>
                      ) : (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setPatientSearch(
                                `${patient.first_name} ${patient.last_name}${
                                  patient.mrn ? ` (${patient.mrn})` : ""
                                }`
                              );
                            }}
                            className={`w-full text-left p-3 hover:bg-muted border-b last:border-b-0 ${
                              selectedPatientId === patient.id ? "bg-muted" : ""
                            }`}
                          >
                            <p className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </p>
                            {patient.mrn && (
                              <p className="text-sm text-muted-foreground">
                                MRN: {patient.mrn}
                              </p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Time</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitType">Visit Type</Label>
                  <select
                    id="visitType"
                    value={selectedVisitTypeId}
                    onChange={(e) => setSelectedVisitTypeId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select visit type...</option>
                    {visitTypesList.map((vt) => (
                      <option key={vt.id} value={vt.id}>
                        {vt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Only show location dropdown if there are 2+ locations */}
                {locations.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <select
                      id="location"
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select location...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resourceName">
                      Room/Resource (optional)
                    </Label>
                    <Input
                      id="resourceName"
                      type="text"
                      placeholder="e.g., Room 3, Exam Room A"
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Checkbox
                        id="isTelemed"
                        checked={isTelemed}
                        onCheckedChange={(checked) =>
                          setIsTelemed(checked === true)
                        }
                      />
                      <Label
                        htmlFor="isTelemed"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1.5"
                      >
                        <Video className="h-4 w-4" />
                        Telehealth
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Appointment Notes</Label>
                  <textarea
                    id="notes"
                    placeholder="Additional appointment notes..."
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewAppointmentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  data-testid="save-appointment-button"
                >
                  {creating
                    ? editingAppointment
                      ? "Updating..."
                      : "Creating..."
                    : editingAppointment
                    ? "Update Appointment"
                    : "Create Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deletingAppointment}
          onOpenChange={() => setDeletingAppointment(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this appointment?
              </DialogDescription>
            </DialogHeader>
            {deletingAppointment && (
              <div className="py-4">
                <p className="font-medium">
                  {deletingAppointment.patient
                    ? deletingAppointment.patient.full_name ||
                      `${deletingAppointment.patient.first_name} ${deletingAppointment.patient.last_name}`
                    : "Unknown Patient"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(deletingAppointment.appointment_datetime)} on{" "}
                  {formatDate(
                    new Date(deletingAppointment.appointment_datetime)
                  )}
                </p>
              </div>
            )}
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Warning:</p>
              <p className="mt-1">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingAppointment(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAppointment}
                disabled={creating}
                data-testid="confirm-delete-appointment"
              >
                {creating ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* No Visit Types Warning Modal */}
        <Dialog
          open={showNoVisitTypesModal}
          onOpenChange={setShowNoVisitTypesModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>No Visit Types Defined</DialogTitle>
              <DialogDescription>
                Your practice needs to define visit types before you can create
                appointments.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Visit types help organize your appointments and ensure the
                correct note templates are used for each patient visit.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNoVisitTypesModal(false)}
              >
                OK
              </Button>
              <Button
                onClick={() =>
                  router.push("/settings/organization?section=visit-types")
                }
              >
                Take me there
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </TranscriptionStatusProvider>
  );
}

// Wrapper component with Suspense boundary
export default function AppointmentsPage() {
  return (
    <>
      <CapabilitiesFetcher />
      <Suspense fallback={<div className="p-8">Loading appointments...</div>}>
        <AppointmentsPageContent />
      </Suspense>
    </>
  );
}
