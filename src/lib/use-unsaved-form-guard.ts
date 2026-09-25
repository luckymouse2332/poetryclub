"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

const UNSAVED_MESSAGE = "当前修改尚未保存，离开后会丢失。确定继续吗？";

export function confirmDiscardUnsavedChanges(): boolean {
  if (!document.querySelector('[data-unsaved-editor="true"]')) return true;
  return window.confirm(UNSAVED_MESSAGE);
}

export function guardUnsavedFormSubmission(event: FormEvent<HTMLFormElement>): void {
  if (!confirmDiscardUnsavedChanges()) event.preventDefault();
}

export function useUnsavedFormGuard() {
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
  }, []);
  const markClean = useCallback(() => {
    dirtyRef.current = false;
    setDirty(false);
  }, []);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    function beforeLinkNavigation(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
      if (!confirmDiscardUnsavedChanges()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        markClean();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeLinkNavigation, true);
    };
  }, [markClean]);

  return { dirty, markDirty, markClean };
}
