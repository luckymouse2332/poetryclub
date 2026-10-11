"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthForm } from "@/features/auth/components/auth-form";

/** 不是上游组件：成员登录门槛组合，只接收说明与路径，不接收受保护正文。 */
export function MemberAccessGate({
  nextPath,
  title,
  description,
  returnHref,
  returnLabel,
}: Readonly<{
  nextPath: string;
  title: string;
  description: string;
  returnHref: string;
  returnLabel: string;
}>) {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-paper/70 backdrop-blur-md"
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (event.target instanceof HTMLElement) {
            event.target
              .querySelector<HTMLInputElement>('input[name="email"]')
              ?.focus();
          }
        }}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AuthForm variant="sign-in-only" embedded nextPath={nextPath} />
        <DialogFooter>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={returnHref}>{returnLabel}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
