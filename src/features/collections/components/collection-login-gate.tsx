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

export function CollectionLoginGate({ nextPath }: Readonly<{ nextPath: string }>) {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-paper/70 backdrop-blur-md"
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (event.target instanceof HTMLElement) {
            event.target.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
          }
        }}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>这个特辑仅成员可见</DialogTitle>
          <DialogDescription>
            请登录，登录成功后会回到当前特辑。
          </DialogDescription>
        </DialogHeader>
        <AuthForm variant="sign-in-only" embedded nextPath={nextPath} />
        <DialogFooter>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/collections">返回特辑列表</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
