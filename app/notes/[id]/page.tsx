"use client";

import { AppLayout } from "@/components/AppLayout";
import { AppointmentOnlyCard } from "@/components/AppointmentOnlyCard";
import { CapabilitiesFetcher } from "@/components/CapabilitiesFetcher";
import { MarkdownTiptapEditor } from "@/components/MarkdownTiptapEditor";
import { NoteActionsBar } from "@/components/NoteActionsBar";
import { PatientCardCompact } from "@/components/PatientCardCompact";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TranscriptionStatusProvider,
  useTranscriptionStatus,
} from "@/contexts/TranscriptionStatusContext";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { useCapabilities } from "@/lib/capabilities";
import { humanizeSectionName } from "@/lib/utils";
import type { Diagnosis } from "@/types";
import type { TranscriptionStatus } from "@/types/note";
import { AlertCircle, CheckCircle, Copy, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import {
  formatDiagnosisForDisplay,
  parseDiagnoses,
} from "@/lib/diagnosis-utils";
import { logger } from "@/lib/logger";
import { marked } from "marked";

interface Note {
  id: string;
  transcription_id: string;
  brief_summary?: string;
  is_signed: boolean;
  signed_at?: string;
  // API returns diagnoses as JSONB array
  diagnoses?: Diagnosis[];
  transcription_status?: TranscriptionStatus;
  emr_settings?: {
    patient_id?: string;
    appointment_datetime?: string;
    external_appointment_id?: string;
  };
  transcriptions?: {
    id: string;
    appointment_id?: string;
    external_appointment_id?: string;
    appointments?: Appointment;
  };
}

interface NoteSection {
  id: string;
  note_id: string;
  section_name: string;
  section_order: number;
  generated_content: string;
  edited_content?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  mrn?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  phr_login_id?: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_datetime: string;
  visit_type_id: string;
  status?: string;
  connection_id?: string | null;
  provider_name?: string;
  appointment_details?: string;
  is_telemed?: boolean;
  patients?: Patient;
  visit_types?: {
    id: string;
    name: string;
  };
  emr_settings?: {
    emr_visit_type?: string;
    appointment_status?: string;
    reason_for_appointment?: string;
    [key: string]: any;
  };
}

// Inner component that uses the transcription status hook
function NotePageContent() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const capabilities = useCapabilities();
  const { getStatus } = useTranscriptionStatus();

  const [note, setNote] = useState<Note | null>(null);
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"sections" | "full">("sections");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<Map<string, string>>(
    new Map()
  );
  const [savingSections, setSavingSections] = useState<Set<string>>(new Set());

  // Error modal state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("Error");

  // Track last seen status to prevent infinite refetches
  const lastStatusRef = useRef<string | null>(null);
  // Track if initial load is complete to prevent double fetch on mount
  const initialLoadCompleteRef = useRef(false);

  // Fetch note data function (memoized to prevent infinite loops)
  const fetchData = useCallback(async () => {
    try {
      // Fetch note with nested appointment and patient details
      const noteData = await apiGet<Note>(`/notes/${noteId}`);
      setNote(noteData);

      // Extract appointment data from nested transcriptions
      const transcription = noteData.transcriptions;
      if (!transcription) {
        logger.error("Note has no transcription relationship");
        return;
      }

      // Set appointment ID (could be local or external)
      const aptId =
        transcription.appointment_id || transcription.external_appointment_id;
      setAppointmentId(aptId || null);

      // Check if this is a local appointment (has nested data) or EMR appointment (data in emr_settings)
      const appointmentData = transcription.appointments;
      if (appointmentData) {
        // Local appointment with nested data
        setAppointment(appointmentData);
        const patientData = appointmentData.patients;
        if (patientData) {
          setPatient(patientData);
        }
      } else if (aptId) {
        // EMR appointment - fetch appointment and patient separately
        try {
          const [appointmentResponse, patientData] = await Promise.all([
            apiGet<Appointment>(`/appointments/${aptId}`),
            noteData.emr_settings?.patient_id
              ? apiGet<Patient>(`/patients/${noteData.emr_settings.patient_id}`)
              : Promise.resolve(null),
          ]);
          setAppointment(appointmentResponse);
          if (patientData) {
            setPatient(patientData);
          }
        } catch (err) {
          logger.error("Error fetching EMR appointment/patient:", err);
          // Continue anyway - we still have the note sections
        }
      }

      // Fetch note sections
      const sectionsData = await apiGet<NoteSection[]>(
        `/notes/${noteId}/sections`
      );
      const sortedSections = sectionsData.sort(
        (a, b) => a.section_order - b.section_order
      );
      setSections(sortedSections);

      // Store original content for each section
      const originalContentMap = new Map<string, string>();
      sortedSections.forEach((section) => {
        originalContentMap.set(
          section.id,
          section.edited_content || section.generated_content
        );
      });
      setOriginalContent(originalContentMap);

      // Mark initial load as complete after first successful fetch
      initialLoadCompleteRef.current = true;
    } catch (error) {
      logger.error("Error fetching note:", error);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, router]);

  // Initialize status ref after initial load to prevent double fetch
  useEffect(() => {
    if (!note?.transcription_id || !initialLoadCompleteRef.current) return;

    const statusData = getStatus(note.transcription_id);
    if (statusData?.status && lastStatusRef.current === null) {
      lastStatusRef.current = statusData.status;
    }
  }, [note?.transcription_id, getStatus]);

  // Refetch note when transcription status becomes "completed"
  useEffect(() => {
    if (!note?.transcription_id || !initialLoadCompleteRef.current) return;

    const statusData = getStatus(note.transcription_id);
    const currentStatus = statusData?.status;

    // Only refetch if status transitions TO "completed" (not if it's already "completed")
    if (
      currentStatus === "completed" &&
      lastStatusRef.current !== "completed"
    ) {
      logger.info(
        "Transcription status changed to completed, refetching note..."
      );
      lastStatusRef.current = "completed";
      fetchData();
    } else if (currentStatus && currentStatus !== lastStatusRef.current) {
      // Update ref to track status changes
      lastStatusRef.current = currentStatus;
    }
  }, [note?.transcription_id, getStatus, fetchData]);

  const copySection = (content: string, sectionId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullNote = () => {
    const fullHtml = sections
      .map((s) => {
        const content = s.edited_content || s.generated_content;
        const sectionTitle = humanizeSectionName(s.section_name);
        // Convert markdown content to HTML
        const htmlContent = marked(content || "", { breaks: true });
        return `<h3 style="margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; font-weight: 600;">${sectionTitle}</h3>${htmlContent}`;
      })
      .join("");

    // Add brief summary at the top if it exists
    const fullNoteHtml = note?.brief_summary
      ? `<div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;"><h3 style="margin-bottom: 0.5rem; font-weight: 600;">Brief Summary:</h3><p>${note.brief_summary}</p></div>${fullHtml}`
      : fullHtml;

    // Copy HTML to clipboard
    navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([fullNoteHtml], { type: "text/html" }),
        "text/plain": new Blob([fullNoteHtml.replace(/<[^>]*>/g, "")], {
          type: "text/plain",
        }),
      }),
    ]);
    setCopiedSection("full");
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Full note copied to clipboard");
  };

  const printNote = () => {
    // Build full note HTML
    const fullHtml = sections
      .map((s) => {
        const content = s.edited_content || s.generated_content;
        const sectionTitle = humanizeSectionName(s.section_name);
        const htmlContent = marked(content || "", { breaks: true });
        return `<div class="note-section">
          <h3 style="margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; font-weight: 600;">${sectionTitle}</h3>
          ${htmlContent}
        </div>`;
      })
      .join("");

    // Add brief summary at the top if it exists
    const fullNoteHtml = note?.brief_summary
      ? `<div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Brief Summary:</h3>
          <p>${note.brief_summary}</p>
        </div>${fullHtml}`
      : fullHtml;

    // Patient info for header
    const patientName = patient
      ? `${patient.first_name} ${patient.last_name}`
      : "Unknown Patient";
    const patientDOB = patient?.date_of_birth
      ? new Date(patient.date_of_birth).toLocaleDateString()
      : "Unknown DOB";
    const headerText = `${patientName} - ${patientDOB}`;

    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the note");
      return;
    }

    // Write HTML with print styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${headerText}</title>
          <style>
            @media print {
              @page {
                margin-top: 1.5in;
                margin-bottom: 1in;
                margin-left: 0.75in;
                margin-right: 0.75in;
                /* Header automatically appears on every page via @page margin box */
                @top-center {
                  content: "${headerText}";
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 10pt;
                  font-weight: 600;
                  border-bottom: 2px solid #333;
                  padding-bottom: 8px;
                }
                /* Footer with page numbers */
                @bottom-center {
                  content: "Page " counter(page);
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 9pt;
                  color: #666;
                  border-top: 1px solid #ccc;
                  padding-top: 8px;
                }
              }

              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #000;
                counter-reset: page;
              }

              /* Note content styles */
              .note-section {
                margin-bottom: 1.5rem;
              }

              p, ul, ol {
                margin-bottom: 0.5rem;
              }
            }

            @media screen {
              body {
                max-width: 8.5in;
                margin: 0 auto;
                padding: 1in 0.75in;
                background: #f5f5f5;
              }

              .note-content {
                background: white;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
            }
          </style>
        </head>
        <body>
          <div class="note-content">
            ${fullNoteHtml}
          </div>

          <script>
            window.onload = function() {
              window.print();
              // Close window after printing (optional - commented out to allow review)
              // window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success("Print dialog opened");
  };

  const saveSection = async (sectionId: string) => {
    if (!note) return;

    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.edited_content) return;

    try {
      setSavingSections((prev) => new Set(prev).add(sectionId));

      // Use apiPatch for authenticated requests
      await apiPatch(`/notes/${note.id}/sections/${sectionId}`, {
        edited_content: section.edited_content,
      });

      // Update original content to the new saved content
      setOriginalContent((prev) => {
        const newMap = new Map(prev);
        newMap.set(sectionId, section.edited_content!);
        return newMap;
      });

      // Show success feedback briefly
      setSavedSection(sectionId);
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      logger.error("Error saving section:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save section. Please try again.";
      setErrorTitle("Save Failed");
      setErrorMessage(message);
      setErrorModalOpen(true);
    } finally {
      setSavingSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Note not found</CardTitle>
            <CardDescription>
              This note does not exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/appointments")}>
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBackToAppointments = () => {
    // Save appointment date to localStorage before navigating
    if (appointment?.appointment_datetime) {
      const aptDate = new Date(appointment.appointment_datetime);
      const year = aptDate.getFullYear();
      const month = String(aptDate.getMonth() + 1).padStart(2, "0");
      const day = String(aptDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      localStorage.setItem("appointmentsDate", dateStr);
    }
    router.push("/appointments");
  };

  // Handler for regenerating note - matches transcribe page implementation
  const handleRegenerateNote = async () => {
    if (!note?.transcription_id) {
      toast.error("Transcription ID not found");
      return;
    }

    if (!appointment?.visit_type_id) {
      toast.error("Visit type not found");
      return;
    }

    try {
      // Step 1: Call regenerate endpoint (visit_type_id is read from transcription)
      await apiPost(`/notes/generate`, {
        transcription_id: note.transcription_id,
        visit_type_id: appointment.visit_type_id,
      });

      // Step 2: Immediately set status to "processing" for instant UI feedback
      // The backend will also set this when the job starts, but we set it immediately
      // so the cancel button appears right away
      await apiPost(
        `/transcription-status/by-transcription/${note.transcription_id}`,
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

      const apiError = error as { message?: string; detail?: string };
      const message =
        apiError.message || apiError.detail || "Failed to regenerate note";
      toast.error(`Error: ${message}`);
    }
  };

  return (
    <>
      <CapabilitiesFetcher />
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/appointments"
                      onClick={() => {
                        // Save appointment date to localStorage before navigating
                        if (appointment?.appointment_datetime) {
                          const aptDate = new Date(
                            appointment.appointment_datetime
                          );
                          const year = aptDate.getFullYear();
                          const month = String(aptDate.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(aptDate.getDate()).padStart(
                            2,
                            "0"
                          );
                          const dateStr = `${year}-${month}-${day}`;
                          localStorage.setItem("appointmentsDate", dateStr);
                        }
                      }}
                    >
                      Schedule
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Note</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Patient and Appointment Cards */}
          {patient && appointment && (
            <div className="mb-6 max-w-4xl mx-auto px-4 space-y-3">
              {/* Patient Card */}
              <div className="flex justify-center">
                <PatientCardCompact
                  patient={{
                    id: patient.id,
                    first_name: patient.first_name,
                    last_name: patient.last_name,
                    mrn: patient.mrn ?? null,
                    date_of_birth: patient.date_of_birth ?? null,
                    gender: patient.gender ?? null,
                    last_appointment: appointment.appointment_datetime ?? null,
                    last_appointment_id: appointment.id ?? null,
                  }}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                />
              </div>

              {/* Appointment Only Card */}
              <div className="flex justify-center">
                <AppointmentOnlyCard
                  appointment={{
                    id: appointment.id,
                    appointment_datetime: appointment.appointment_datetime,
                    appointment_details:
                      appointment.appointment_details ?? null,
                    connection_id: appointment.connection_id ?? null,
                    provider_name: appointment.provider_name ?? null,
                    is_telemed: appointment.is_telemed ?? false,
                    visit_type: appointment.visit_types
                      ? { name: appointment.visit_types.name }
                      : null,
                    emr_settings: appointment.emr_settings ?? {},
                    ...(note.transcription_status
                      ? { transcription_status: note.transcription_status }
                      : {}),
                  }}
                />
              </div>
            </div>
          )}

          {/* Brief Summary & Diagnoses Card */}
          <Card className="mb-6">
            <CardContent className="pt-6 px-4 sm:px-6">
              <div className="space-y-6">
                {/* Brief Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Brief Summary
                  </h3>
                  {note.brief_summary ? (
                    <p className="text-sm">{note.brief_summary}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No summary available
                    </p>
                  )}
                </div>

                {/* Diagnoses */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Diagnoses
                  </h3>
                  {(() => {
                    const parsedDiagnoses = parseDiagnoses(note.diagnoses);
                    return parsedDiagnoses.length > 0 ? (
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {parsedDiagnoses.map((diagnosis, index) => (
                          <li key={index}>
                            {formatDiagnosisForDisplay(diagnosis)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No diagnoses recorded
                      </p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 mb-4 overflow-x-auto">
            <NoteActionsBar
              transcriptionId={note.transcription_id}
              appointmentId={appointmentId || ""}
              visitTypeId={appointment?.visit_type_id || null}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCopyFullNote={copyFullNote}
              onPrintNote={printNote}
              copiedFull={copiedSection === "full"}
              onRegenerate={handleRegenerateNote}
              className=""
              editTemplateMode="modal"
              editTemplateLabel="Make Template Changes"
            />
          </div>

          {/* Edit View */}
          {viewMode === "sections" && (
            <div className="space-y-4 px-4 sm:px-0">
              {sections.map((section) => {
                const content =
                  section.edited_content || section.generated_content;
                const originalText = originalContent.get(section.id) || "";
                const hasChanges = content !== originalText;

                return (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg">
                          {humanizeSectionName(section.section_name)}
                        </CardTitle>
                        <div className="flex gap-2 flex-shrink-0">
                          {hasChanges ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => saveSection(section.id)}
                              disabled={
                                savingSections.has(section.id) || note.is_signed
                              }
                            >
                              {savingSections.has(section.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  <span className="hidden sm:inline">Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Save</span>
                                </>
                              )}
                            </Button>
                          ) : savedSection === section.id ? (
                            <Button variant="default" size="sm" disabled>
                              <CheckCircle className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Saved!</span>
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copySection(content, section.id)}
                            disabled={note.is_signed}
                          >
                            {copiedSection === section.id && !hasChanges ? (
                              <>
                                <CheckCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Dynamic height based on content length - minimum 200px, max 400px */}
                      <MarkdownTiptapEditor
                        key={section.id}
                        value={content || ""}
                        onChange={(markdown: string) => {
                          // Update section edited_content
                          setSections(
                            sections.map((s) =>
                              s.id === section.id
                                ? { ...s, edited_content: markdown }
                                : s
                            )
                          );
                        }}
                        height={Math.max(
                          200,
                          Math.min(400, (content?.length || 0) / 3)
                        )}
                        readOnly={note.is_signed}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Full Note View */}
          {viewMode === "full" && (
            <Card>
              <CardContent className="pt-6 px-4 sm:px-6">
                {note.brief_summary && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                      Brief Summary:
                    </h3>
                    <p className="text-base text-foreground">{note.brief_summary}</p>
                  </div>
                )}
                <div className="space-y-8">
                  {sections.map((section) => {
                    const content =
                      section.edited_content || section.generated_content;
                    return (
                      <div key={section.id}>
                        <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-foreground">
                          {humanizeSectionName(section.section_name)}
                        </h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note Metadata */}
          {note.is_signed && note.signed_at && (
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6 px-4 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  This note was signed on{" "}
                  {new Date(note.signed_at).toLocaleString()} and is now
                  read-only.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error Modal */}
          <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
            <DialogContent>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <DialogTitle>{errorTitle}</DialogTitle>
                </div>
                <DialogDescription className="pt-4">
                  {errorMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setErrorModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </>
  );
}

// Outer wrapper component that provides the transcription status context
export default function NotePage() {
  const params = useParams();
  const noteId = params.id as string;

  // Get transcription_id for the provider (need to fetch note once)
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const getTranscriptionId = async () => {
      try {
        const noteData = await apiGet<Note>(`/notes/${noteId}`);
        if (noteData.transcription_id) {
          setTranscriptionId(noteData.transcription_id);
        }
      } catch (error) {
        logger.error("Error fetching note for transcription ID:", error);
      }
    };
    getTranscriptionId();
  }, [noteId]);

  const transcriptionIds = useMemo(() => {
    return transcriptionId ? [transcriptionId] : [];
  }, [transcriptionId]);

  return (
    <TranscriptionStatusProvider transcriptionIds={transcriptionIds}>
      <NotePageContent />
    </TranscriptionStatusProvider>
  );
}
