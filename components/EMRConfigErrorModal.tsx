"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useCapabilitiesStore } from "@/store/capabilitiesStore";

interface EMRConfigError {
  message: string;
  redirect_url: string;
  connection_name?: string;
}

/**
 * Global EMR Configuration Error Modal
 *
 * Listens for 'emr-configuration-error' events from api-client
 * and displays a modal with instructions to configure EMR.
 *
 * Place this component at the root layout level to handle errors globally.
 */
export function EMRConfigErrorModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<EMRConfigError | null>(null);
  const clearCapabilities = useCapabilitiesStore((state) => state.clearCapabilities);

  useEffect(() => {
    // Check for stored error on mount (in case page was refreshed)
    const storedError = sessionStorage.getItem('emr_config_error');
    if (storedError) {
      try {
        const errorData = JSON.parse(storedError);
        setError(errorData);
        setIsOpen(true);
        // Clear capabilities to prevent unauthorized API calls
        clearCapabilities();
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Listen for EMR configuration errors
    const handleEMRError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const errorData = customEvent.detail;

      setError({
        message: errorData.message || "EMR configuration is incomplete",
        redirect_url: errorData.redirect_url || "/settings/charm",
        connection_name: errorData.connection_name
      });
      setIsOpen(true);

      // Clear capabilities immediately to prevent further unauthorized API calls
      clearCapabilities();
    };

    window.addEventListener('emr-configuration-error', handleEMRError);

    return () => {
      window.removeEventListener('emr-configuration-error', handleEMRError);
    };
  }, [clearCapabilities]);

  const handleGoToSettings = () => {
    // Clear stored error
    sessionStorage.removeItem('emr_config_error');
    setIsOpen(false);

    // Navigate to EMR settings page
    if (error?.redirect_url) {
      router.push(error.redirect_url);
    }
  };

  const handleDismiss = () => {
    // Clear stored error
    sessionStorage.removeItem('emr_config_error');
    setIsOpen(false);
  };

  if (!error) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <DialogTitle className="text-xl">EMR Configuration Required</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            {error.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="font-medium text-yellow-900 mb-2">What you need to do:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Complete the EMR connection setup for {error.connection_name || 'your EMR'}</li>
              <li>Verify your credentials are properly saved</li>
              <li>Test the connection to ensure it works</li>
            </ol>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> This issue typically occurs when an administrator manually activates
              an EMR connection without completing the credential setup. Please contact your administrator
              or complete the setup process.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
          <Button
            onClick={handleGoToSettings}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to EMR Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
