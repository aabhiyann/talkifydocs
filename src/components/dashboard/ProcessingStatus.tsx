import { mapDbUploadStatusToUi, UploadStatus } from "@/hooks/useUploadStatus";
import { Badge } from "../ui/badge";

type Props = {
  dbStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
};

export const ProcessingStatus = ({ dbStatus }: Props) => {
  const status: UploadStatus = mapDbUploadStatusToUi(dbStatus);

  switch (status) {
    case "success":
      return (
        <Badge variant="secondary" className="text-xs">
          Ready to chat
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="text-xs">
          Processing…
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="text-xs">
          Processing failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Pending
        </Badge>
      );
  }
};
