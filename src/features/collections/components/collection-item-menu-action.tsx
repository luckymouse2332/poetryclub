"use client";

import { startTransition, useActionState } from "react";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import type { CollectionActionState } from "@/features/collections/actions";

type ItemAction = (state: CollectionActionState, formData: FormData) => Promise<CollectionActionState>;
const INITIAL_STATE: CollectionActionState = { status: "idle" };

export function CollectionItemMenuAction({
  action,
  title,
}: Readonly<{ action: ItemAction; title: string }>) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton type="button" variant="ghost" aria-label={`更多操作：${title}`} disabled={pending}>
            <MoreHorizontal aria-hidden="true" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={() => startTransition(() => formAction(new FormData()))}>
            移除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-1 max-w-64 text-label text-danger">{state.message}</p>
      ) : null}
    </div>
  );
}
