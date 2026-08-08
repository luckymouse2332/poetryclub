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

type MemberLoginGateProps = Readonly<{
  nextPath: string;
}>;

/**
 * 游客直达成员作品时使用的登录门槛。受保护作品数据不会作为 props 传入，
 * Dialog 背后只渲染页面提供的通用占位内容。
 */
export function MemberLoginGate({ nextPath }: MemberLoginGateProps) {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-paper/70 backdrop-blur-md"
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>这篇作品仅成员可见</DialogTitle>
          <DialogDescription>
            请登录，登录成功后会回到当前作品。
          </DialogDescription>
        </DialogHeader>
        <AuthForm
          variant="sign-in-only"
          embedded
          nextPath={nextPath}
        />
        <DialogFooter>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/poems">返回诗作列表</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
