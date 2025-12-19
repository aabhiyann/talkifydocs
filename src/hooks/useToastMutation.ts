import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { captureException } from "@/lib/sentry";

interface ToastOptions {
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  refreshOnSuccess?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useToastOptions(options: ToastOptions = {}) {
  const { toast } = useToast();
  const router = useRouter();

  return {
    onSuccess: (data: any) => {
      if (options.successTitle || options.successDescription) {
        toast({
          title: options.successTitle,
          description: options.successDescription,
        });
      }
      if (options.refreshOnSuccess) {
        router.refresh();
      }
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      captureException(error, { 
        title: options.errorTitle || "Mutation Error",
        description: options.successTitle ? `Failed during: ${options.successTitle}` : undefined
      });
      toast({
        title: options.errorTitle || "Error",
        description: error.message,
        variant: "destructive",
      });
      options.onError?.(error);
    },
  };
}