"use client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { createCommentAction, type CommentActionState } from "@/features/comments/actions";
import { COMMENT_BODY_MAX_LENGTH } from "@/server/validation/comments";
const INITIAL_STATE: CommentActionState = { status: "idle" };

export function CommentForm({
  poemId,
  parentId,
  initialCreationToken,
  onSuccess,
}: Readonly<{
  poemId: string;
  parentId: string | null;
  initialCreationToken?: string;
  onSuccess?: () => void;
}>) {
  const router = useRouter();
  const [creationToken] = useState(() => initialCreationToken ?? crypto.randomUUID());
  const completed = useRef<CommentActionState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const action = createCommentAction.bind(null, poemId, parentId);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.status !== "success" || completed.current === state) return;
    completed.current = state;
    formRef.current?.reset();
    if (tokenRef.current) tokenRef.current.value = crypto.randomUUID();
    router.refresh();
    onSuccess?.();
  }, [state, router, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input
        ref={tokenRef}
        type="hidden"
        name="creationToken"
        defaultValue={creationToken}
      />
      {state.message ? (
        <Alert
          variant={state.status === "success" ? "success" : "danger"}
          role="status"
        >
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id={`comment-body-${parentId ?? "root"}`}
        label={parentId ? "回复内容" : "评论内容"}
        required
        disabled={pending}
        error={state.fieldError}
        description="纯文本，最多 2000 个字符。"
      >
        {(controlProps) => (
          <Textarea
            {...controlProps}
            name="body"
            rows={parentId ? 4 : 5}
            maxLength={COMMENT_BODY_MAX_LENGTH}
            placeholder={parentId ? "写下你的回复" : "写下与作品有关的评论或补充"}
          />
        )}
      </FormField>
      <Button type="submit" loading={pending}>
        {pending ? "正在发布…" : parentId ? "发布回复" : "发布评论"}
      </Button>
    </form>
  );
}

