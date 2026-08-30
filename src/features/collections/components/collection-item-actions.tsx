"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { CollectionActionState } from "@/features/collections/actions";

type ItemAction = (
  state: CollectionActionState,
  formData: FormData,
) => Promise<CollectionActionState>;

const INITIAL_STATE: CollectionActionState = { status: "idle" };

export function CollectionItemAction({
  action,
  label,
  busyLabel,
  variant = "secondary",
}: Readonly<{
  action: ItemAction;
  label: string;
  busyLabel: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}>) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  return (
    <form action={formAction} className="contents">
      <Button type="submit" size="sm" variant={variant} loading={pending}>
        {pending ? busyLabel : label}
      </Button>
      {state.status === "error" && state.message ? (
        <span role="alert" className="basis-full text-caption text-danger">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
