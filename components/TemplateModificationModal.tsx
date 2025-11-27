"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
interface TemplateModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitTypeId: string;
}

interface VisitType {
  id: string;
  name: string;
  duration_minutes: number;
}

/**
 * TemplateModificationModal
 *
 * Right-side drawer for suggesting changes to note generation template.
 * - Hidden by default until user clicks "Suggest Template Changes"
 * - Allows user to scroll and view the current note while making suggestions
 * - Shows confirmation dialog after submission
 * - Clarifies that changes won't affect current note (requires regeneration)
 * - Sends suggestions to AI agent for template modification
 */
export function TemplateModificationModal({
  open,
  onOpenChange,
  visitTypeId,
}: TemplateModificationModalProps) {
  const [prompt, setPrompt] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [isLoadingVisitType, setIsLoadingVisitType] = useState(false);

  // Fetch visit type details when drawer opens
  useEffect(() => {
    if (open && visitTypeId) {
      setIsLoadingVisitType(true);
      apiGet<VisitType>(`/visit-types/${visitTypeId}`)
        .then((data) => setVisitType(data))
        .catch((error) => {
          logger.error("Error fetching visit type:", error);
          // Don't show error to user, just use ID as fallback
        })
        .finally(() => setIsLoadingVisitType(false));
    }
  }, [open, visitTypeId]);

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast.error("Please enter your suggestions");
      return;
    }

    // Fire-and-forget: Submit API request without awaiting
    apiPost("/note-sections/modify-with-prompt", {
      visit_type_id: visitTypeId,
      user_prompt: prompt.trim(),
    }).catch((error) => {
      logger.error("Error submitting template modification:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit modification request";
      toast.error(message);
    });

    // Immediately show confirmation dialog and toast (don't wait for processing)
    setShowConfirmation(true);
    toast.success("Template modification submitted successfully");
  };

  const handleClose = () => {
    setPrompt("");
    setCollapsed(false);
    setVisitType(null);
    onOpenChange(false);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    handleClose(); // Hide drawer and reset state
  };

  // Don't render anything if not open
  if (!open) return null;

  return (
    <>
      {/* Right-Side Drawer */}
      <div
        className={`fixed right-0 top-16 bottom-0 bg-card border-l border-border shadow-lg z-40 transition-all duration-300 overflow-hidden ${
          collapsed ? "w-12" : "w-[400px]"
        }`}
      >
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-base font-semibold">
              {isLoadingVisitType ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : visitType ? (
                `Suggest Changes: ${visitType.name}`
              ) : (
                "Suggest Template Changes"
              )}
            </h2>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-muted p-1.5 rounded transition-colors"
              title={collapsed ? "Expand drawer" : "Collapse drawer"}
            >
              {collapsed ? (
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="hover:bg-muted p-1.5 rounded transition-colors"
              title="Close drawer"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content (only visible when not collapsed) */}
        {!collapsed && (
          <>
            <div
              className="p-4 overflow-y-auto"
              style={{ height: "calc(100vh - 14rem)" }}
            >
              <div className="space-y-4">
                {/* Important notice */}
                <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 rounded p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ Changes will apply to future notes only
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    To see changes in this note, you'll need to regenerate it.
                  </p>
                </div>

                {/* Textarea for suggestions */}
                <div>
                  <label
                    htmlFor="template-suggestions"
                    className="text-sm font-medium block mb-2"
                  >
                    What changes would you like to make?
                  </label>
                  <Textarea
                    id="template-suggestions"
                    placeholder="Example: Make the assessment section more concise, add a section for follow-up plan, use less technical language..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Describe the changes in plain language. Our AI will modify
                    the template accordingly.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t p-4 flex justify-between gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Link
                  href={`/settings/note-sections?visit_type=${visitTypeId}`}
                >
                  <Button variant="outline" onClick={handleClose}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit Template Directly
                  </Button>
                </Link>
                <Button onClick={handleSubmit} disabled={!prompt.trim()}>
                  Submit Changes
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog (standard modal after submission) */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Modification Submitted</DialogTitle>
            <DialogDescription>
              Your template changes are being processed and will be ready in 2-3
              minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 rounded p-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Important: This won't affect your current note
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">To see these changes:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  Regenerate this note (wait 2-3 minutes for processing to
                  complete)
                </li>
                <li>OR edit the note directly for immediate changes</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Link href={`/settings/note-sections?visit_type=${visitTypeId}`}>
              <Button variant="outline" onClick={handleConfirmationClose}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Template Settings
              </Button>
            </Link>
            <Button onClick={handleConfirmationClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
