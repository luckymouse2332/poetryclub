"use client";

import { useEffect } from "react";
import { acknowledgeAnnouncementAction } from "@/features/notifications/actions";

/** Record an actual mounted visit; rendering or prefetch alone never marks read. */
export function AnnouncementReadReceipt({ id }: Readonly<{ id: string }>) {
  useEffect(() => {
    void acknowledgeAnnouncementAction(id).catch(() => {
      // Keep the detail readable if acknowledgement fails; a later visit retries.
    });
  }, [id]);
  return null;
}
