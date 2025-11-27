"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { NavigationMenu } from "@/components/NavigationMenu";
import { PatientCardCompact } from "@/components/PatientCardCompact";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Loader2, MessageSquare } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  mrn?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  last_appointment?: string | null;
  last_appointment_id?: string | null;
  next_appointment?: string | null;
  next_appointment_id?: string | null;
};

export function TitleBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    // Set loading state
    setIsSearching(true);
    setIsOpen(true);

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await apiGet<{ patients: Patient[] }>(`/patients/search/${encodeURIComponent(searchQuery)}`);
        setSearchResults(response.patients || []);
      } catch (error) {
        logger.error("Error searching patients:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handlePatientClick = (patientId: string) => {
    setSearchQuery("");
    setSearchResults([]);
    setIsOpen(false);
    router.push(`/patients/${patientId}`);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSendingFeedback(true);
    try {
      await apiPost("/feedback", {
        feedback: feedbackText,
        current_page: pathname || window.location.pathname,
      });

      toast.success("Feedback submitted successfully! Thank you.");
      setFeedbackText("");
      setFeedbackOpen(false);
    } catch (error) {
      logger.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 gap-2 sm:gap-4">
        {/* Hamburger Menu */}
        <div className="flex-shrink-0">
          <NavigationMenu />
        </div>

        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Image
            src="/images/write-great-notes-logo.png"
            alt="Write Great Notes"
            width={40}
            height={40}
            className="flex-shrink-0"
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="text-xl font-semibold hidden lg:inline whitespace-nowrap">
            write<span className="text-jordy-blue">great</span>notes.ai
          </span>
          <span className="text-xl font-semibold lg:hidden hidden sm:inline whitespace-nowrap">
            <span className="text-jordy-blue">WGN</span>.ai
          </span>
        </div>

        {/* Global Patient Search - Flexible */}
        <div className="flex-1 min-w-0 max-w-md mx-auto">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 w-full"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[min(580px,90vw)] p-2 max-h-[400px] overflow-y-auto"
              align="center"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientClick(patient.id)}
                    >
                      <PatientCardCompact
                        patient={patient}
                        onClick={() => handlePatientClick(patient.id)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {isSearching ? "Searching..." : "No patients found"}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Feedback Button */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeedbackOpen(true)}
            className="hidden sm:flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden lg:inline">Submit Feedback</span>
          </Button>
        </div>

        {/* Theme Toggle */}
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Help us improve Write Great Notes by sharing your thoughts, suggestions, or reporting issues.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[150px]"
              disabled={isSendingFeedback}
            />
            <p className="text-xs text-muted-foreground">
              Page: {pathname || "Unknown"}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackOpen(false)}
              disabled={isSendingFeedback}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={isSendingFeedback || !feedbackText.trim()}
            >
              {isSendingFeedback ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
