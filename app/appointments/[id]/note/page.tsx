"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { TranscriptionStatusProvider } from "@/contexts/TranscriptionStatusContext";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentStatusBar } from "@/components/AppointmentStatusBar";
import { AppLayout } from "@/components/AppLayout";
import { PatientCard } from "@/components/PatientCard";
import { AppointmentOnlyCard } from "@/components/AppointmentOnlyCard";
import { NoteActionsBar } from "@/components/NoteActionsBar";
import { Copy, FileText, CheckCircle, Upload, Save, Loader2, RefreshCw, MoreHorizontal, Settings } from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { useCapabilities, CAPABILITIES } from "@/lib/capabilities";
import { humanizeSectionName } from "@/lib/utils";
import { MarkdownTiptapEditor } from "@/components/MarkdownTiptapEditor";
import type { Diagnosis } from "@/types";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
import { parseDiagnoses, formatDiagnosisForDisplay, type ParsedDiagnosis } from "@/lib/diagnosis-utils";

interface Note {
  id: string;
  appointment_id: string;
  transcription_id: string;
  brief_summary?: string;
  is_signed: boolean;
  signed_at?: string;
  diagnoses?: Diagnosis[];
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
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_datetime: string;
  visit_type_id?: string | null;
  visit_type?: {
    id?: string | null;
    name: string;
  } | null;
  status: string;
  connection_id?: string | null;
}

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const capabilities = useCapabilities();

  const [note, setNote] = useState<Note | null>(null);
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"sections" | "full">("sections");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [regeneratingNote, setRegeneratingNote] = useState(false);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<string | null>(null);
  const [visitTypeId, setVisitTypeId] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<Map<string, string>>(new Map());
  const [savingSections, setSavingSections] = useState<Set<string>>(new Set());
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState("");
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointment first to get connection_id
        const appointmentData = await apiGet<Appointment>(
          `/appointments/${appointmentId}`
        );
        setAppointment(appointmentData);

        // Get transcription for this appointment, passing connection_id if it exists
        const transcriptionUrl = appointmentData.connection_id
          ? `/transcriptions/by-appointment/${appointmentId}?connection_id=${appointmentData.connection_id}`
          : `/transcriptions/by-appointment/${appointmentId}`;

        const transcriptionData = await apiGet<any>(transcriptionUrl);

        if (!transcriptionData?.id) {
          router.push(`/appointments/${appointmentId}/transcribe`);
          return;
        }

        // Store transcription ID and visit type ID for regenerate functionality and template navigation
        setTranscriptionId(transcriptionData.id);

        // Get visit type ID from appointment (for "Make Changes to Template" link)
        if (appointmentData.visit_type_id) {
          setVisitTypeId(appointmentData.visit_type_id);
        }

        // Get note from transcription status
        const statusResponse = await apiGet<any>(
          `/transcription-status/by-transcription/${transcriptionData.id}`
        );

        if (!statusResponse.note_id) {
          router.push(`/appointments/${appointmentId}/transcribe`);
          return;
        }

        // Store workflow status for button visibility
        setWorkflowStatus(statusResponse.status);

        // Redirect to transcribe page if status is processing or failed
        if (statusResponse.status === "processing" || statusResponse.status === "failed") {
          router.push(`/appointments/${appointmentId}/transcribe`);
          return;
        }

        // Fetch note
        const noteData = await apiGet<Note>(
          `/notes/${statusResponse.note_id}`
        );
        setNote(noteData);

        // Fetch note sections
        const sectionsData = await apiGet<NoteSection[]>(
          `/notes/${statusResponse.note_id}/sections`
        );
        const sortedSections = sectionsData.sort((a, b) => a.section_order - b.section_order);
        setSections(sortedSections);

        // Store original content for each section
        const originalContentMap = new Map<string, string>();
        sortedSections.forEach(section => {
          originalContentMap.set(
            section.id,
            section.edited_content || section.generated_content
          );
        });
        setOriginalContent(originalContentMap);

        // Fetch patient
        const patientData = await apiGet<Patient>(
          `/patients/${appointmentData.patient_id}`
        );
        setPatient(patientData);
      } catch (error) {
        logger.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId, router]);

  const copySection = (content: string, sectionId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullNote = () => {
    const fullText = sections
      .map((s) => {
        const content = s.edited_content || s.generated_content;
        const sectionTitle = humanizeSectionName(s.section_name);
        return `${sectionTitle}\n\n${content}`;
      })
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(fullText);
    setCopiedSection("full");
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Full note copied to clipboard");
  };

  const saveSection = async (sectionId: string) => {
    if (!note) return;

    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.edited_content) return;

    try {
      setSavingSections(prev => new Set(prev).add(sectionId));

      // Use apiPatch for authenticated requests
      await apiPatch(`/notes/${note.id}/sections/${sectionId}`, {
        edited_content: section.edited_content
      });

      // Update original content to the new saved content
      setOriginalContent(prev => {
        const newMap = new Map(prev);
        newMap.set(sectionId, section.edited_content!);
        return newMap;
      });

      // Show success feedback briefly
      setSavedSection(sectionId);
      setTimeout(() => setSavedSection(null), 2000);
    } catch (error) {
      logger.error("Error saving section:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save section. Please try again.";

      // Show error dialog
      setErrorDialogTitle('Error Saving Section');
      setErrorDialogMessage(errorMessage);
      setErrorDialogOpen(true);
    } finally {
      setSavingSections(prev => {
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

  const handleRegenerateNote = async () => {
    if (!transcriptionId) return;

    try {
      setRegeneratingNote(true);

      // Call the regenerate endpoint (visit_type_id is read from transcription)
      await apiPost(`/notes/generate`, {
        transcription_id: transcriptionId,
      });

      // Show success toast
      toast.success('Note regeneration started. This may take a moment...');

      // Reload the page after a delay to show the new note
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: unknown) {
      logger.error('Error regenerating note:', error);
      const message = error instanceof Error ? error.message : 'Failed to regenerate note';

      // Show error dialog
      setErrorDialogTitle('Error Regenerating Note');
      setErrorDialogMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setRegeneratingNote(false);
    }
  };

  if (!note) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Note not found</CardTitle>
            <CardDescription>
              This appointment does not have a generated note yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() =>
                router.push(`/appointments/${appointmentId}/transcribe`)
              }
            >
              Go to Transcription
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
      const month = String(aptDate.getMonth() + 1).padStart(2, '0');
      const day = String(aptDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      localStorage.setItem('appointmentsDate', dateStr);
    }
    router.push("/appointments");
  };

  // Extract transcription ID for status subscription
  const transcriptionIds = useMemo(() => {
    return transcriptionId ? [transcriptionId] : [];
  }, [transcriptionId]);

  return (
    <TranscriptionStatusProvider transcriptionIds={transcriptionIds}>
      <AppLayout>
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/appointments" onClick={() => {
                  // Save appointment date to localStorage before navigating
                  if (appointment?.appointment_datetime) {
                    const aptDate = new Date(appointment.appointment_datetime);
                    const year = aptDate.getFullYear();
                    const month = String(aptDate.getMonth() + 1).padStart(2, '0');
                    const day = String(aptDate.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    localStorage.setItem('appointmentsDate', dateStr);
                  }
                }}>
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

      {/* Patient and Appointment Info */}
      {patient && appointment && (
        <div className="mb-4 space-y-3">
          <div className="flex justify-center">
            <PatientCard
              patient={patient}
              onClick={() => router.push(`/patients/${patient.id}`)}
              showAppointments={false}
            />
          </div>
          <div className="flex justify-center">
            <AppointmentOnlyCard
              appointment={appointment}
              onClick={() => router.push(`/appointments/${appointmentId}/transcribe`)}
            />
          </div>
        </div>
      )}

      {/* Brief Summary & Diagnoses Card */}
      <Card className="mb-4 border-muted max-w-3xl mx-auto">
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brief Summary - Left */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                Brief Summary
              </h3>
              {note.brief_summary ? (
                <p className="text-xs">{note.brief_summary}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No summary available
                </p>
              )}
            </div>

            {/* Diagnoses - Right */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-1">
                Diagnoses
              </h3>
              {(() => {
                const parsedDiagnoses = parseDiagnoses(note.diagnoses);
                return parsedDiagnoses.length > 0 ? (
                  <ul className="text-xs list-disc list-inside space-y-0.5">
                    {parsedDiagnoses.map((diagnosis, index) => (
                      <li key={index}>
                        {formatDiagnosisForDisplay(diagnosis)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No diagnoses recorded
                  </p>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle & Actions */}
      <NoteActionsBar
        transcriptionId={note.transcription_id}
        appointmentId={appointmentId}
        visitTypeId={visitTypeId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCopyFullNote={copyFullNote}
        copiedFull={copiedSection === "full"}
        onRegenerate={handleRegenerateNote}
        className="mt-6 mb-4 max-w-3xl mx-auto"
      />

      {/* Edit View */}
      {viewMode === "sections" && (
        <div className="space-y-3 max-w-3xl mx-auto">
          {sections.map((section) => {
            const content = section.edited_content || section.generated_content;
            const originalText = originalContent.get(section.id) || '';
            const hasChanges = content !== originalText;

            return (
              <Card key={section.id} className="border-muted">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {humanizeSectionName(section.section_name)}
                    </CardTitle>
                    <div className="flex gap-1">
                      {hasChanges ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => saveSection(section.id)}
                          disabled={savingSections.has(section.id) || note.is_signed}
                          className="h-7 px-2 text-xs"
                        >
                          {savingSections.has(section.id) ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                      ) : savedSection === section.id ? (
                        <Button
                          variant="default"
                          size="sm"
                          disabled
                          className="h-7 px-2 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Saved!
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySection(content, section.id)}
                        disabled={note.is_signed}
                        className="h-7 px-2 text-xs"
                      >
                        {copiedSection === section.id && !hasChanges ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <MarkdownTiptapEditor
                    key={`section-${section.id}`}
                    value={content || ''}
                    onChange={(markdown) => {
                      // Update section edited_content
                      setSections(
                        sections.map((s) =>
                          s.id === section.id
                            ? { ...s, edited_content: markdown }
                            : s
                        )
                      );
                    }}
                    height={200}
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
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            {note.brief_summary && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Brief Summary:</h3>
                <p className="text-base">{note.brief_summary}</p>
              </div>
            )}
            <div className="space-y-8">
              {sections.map((section) => {
                const content =
                  section.edited_content || section.generated_content;
                return (
                  <div key={section.id}>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      {humanizeSectionName(section.section_name)}
                    </h3>
                    <div className="prose prose-sm max-w-none">
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
        <Card className="mt-6 bg-muted/50 max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This note was signed on{" "}
              {new Date(note.signed_at).toLocaleString()} and is now read-only.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialogTitle}</DialogTitle>
            <DialogDescription className="pt-4">
              {errorDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
    </TranscriptionStatusProvider>
  );
}
