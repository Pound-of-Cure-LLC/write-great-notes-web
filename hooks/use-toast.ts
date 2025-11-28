// Toast implementation using sonner
import { toast as sonnerToast } from "sonner";

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
      if (variant === "destructive") {
        sonnerToast.error(title, {
          description: description,
        });
      } else {
        sonnerToast.success(title, {
          description: description,
        });
      }
    },
  };
}
