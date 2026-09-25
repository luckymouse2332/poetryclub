"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

export function AuthErrorPopover({
  message,
  open,
  onOpenChange,
}: Readonly<{
  message?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  if (!message) return null;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <Alert variant="danger" role="alert" className="border-2 shadow-card">
          <AlertTitle>操作未完成</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-[min(24rem,calc(100vw-2rem))] border-danger bg-danger-surface p-4 text-danger shadow-floating"
      >
        <p className="font-medium">请检查后重试</p>
        <p className="mt-2 text-label leading-copy">{message}</p>
        <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => onOpenChange(false)}>
          知道了
        </Button>
      </PopoverContent>
    </Popover>
  );
}
