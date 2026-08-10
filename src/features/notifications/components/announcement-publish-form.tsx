"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  INITIAL_ANNOUNCEMENT_ACTION_STATE,
  type AnnouncementActionState,
} from "@/features/notifications/announcement-action-state";

type AnnouncementPublishFormProps = Readonly<{
  action: (
    state: AnnouncementActionState,
    formData: FormData,
  ) => Promise<AnnouncementActionState>;
}>;

export function AnnouncementPublishForm({ action }: AnnouncementPublishFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ANNOUNCEMENT_ACTION_STATE,
  );
  return (
    <form action={formAction} className="space-y-3">
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-label text-danger"
              : "text-label text-success"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" variant="danger" loading={pending}>
        {pending ? "正在发布…" : "发布公告"}
      </Button>
    </form>
  );
}
