// Toast implementation using sonner
import { toast as sonnerToast } from "sonner";

import { logger } from "@/lib/logger";
export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = "default",
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      const message = description || title || "";

      if (variant === "destructive") {
        logger.error(`${title}: ${description}`);
        sonnerToast.error(title, {
          description: description,
        });
      } else {
        logger.debug(`${title}: ${description}`);
        sonnerToast.success(title, {
          description: description,
        });
      }
    },
  };
}
