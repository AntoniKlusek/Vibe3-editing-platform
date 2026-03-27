import { Badge } from "@vibe3/ui";
import type { VideoStatus } from "@vibe3/db/schema";

export function StatusBadge({ status }: { status: VideoStatus }) {
  const variantMap: Record<string, any> = {
    PENDING: "pending",
    PROCESSING: "processing",
    READY: "ready",
    FAILED: "failed",
  };

  return (
    <Badge variant={variantMap[status] || "default"}>
      {status}
    </Badge>
  );
}
