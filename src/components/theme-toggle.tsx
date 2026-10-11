"use client";

/** 不是上游组件：主题切换业务组合，复用现有 IconButton，不新增 UI 原语。 */
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import {
  parseTheme,
  resolveTheme,
  THEME_INITIALIZATION_SCRIPT,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

const subscribeInitialization = () => () => {};
const initializationClientSnapshot = () => true;
const initializationServerSnapshot = () => false;

/** Emit the parser-time script only in initial HTML; never insert inert scripts on client navigation. */
export function ThemeInitialization() {
  const hydrated = useSyncExternalStore(
    subscribeInitialization,
    initializationClientSnapshot,
    initializationServerSnapshot,
  );
  return hydrated ? null : (
    <script
      id="theme-initialization"
      dangerouslySetInnerHTML={{ __html: THEME_INITIALIZATION_SCRIPT }}
    />
  );
}

const listeners = new Set<() => void>();
let memoryPreference: Theme | null = null;
let systemQuery: MediaQueryList | undefined;

function readPreference() {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return memoryPreference;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((notify) => notify());
}

function onSystemChange(event: MediaQueryListEvent) {
  if (!readPreference()) applyTheme(resolveTheme(null, event.matches));
}

function onStorageChange(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
  memoryPreference = parseTheme(event.newValue);
  applyTheme(resolveTheme(readPreference(), systemQuery?.matches ?? false));
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) {
    systemQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemQuery.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorageChange);
    // Catch system changes between head initialization and hydration.
    document.documentElement.dataset.theme = resolveTheme(
      readPreference(),
      systemQuery.matches,
    );
  }
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) {
      systemQuery?.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorageChange);
    }
  };
}

function getSnapshot(): Theme {
  return parseTheme(document.documentElement.dataset.theme) ?? "light";
}

function getServerSnapshot() {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = theme === "dark";
  const label = dark ? "切换浅色模式" : "切换深色模式";

  return (
    <IconButton
      type="button"
      variant="ghost"
      data-slot="theme-toggle"
      aria-label={label}
      title={label}
      disabled={theme === null}
      onClick={() => {
        const next = dark ? "light" : "dark";
        memoryPreference = next;
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          /* Current-tab choice still works. */
        }
        applyTheme(next);
      }}
    >
      {dark ? (
        <Sun aria-hidden="true" strokeWidth={1.75} />
      ) : (
        <Moon aria-hidden="true" strokeWidth={1.75} />
      )}
    </IconButton>
  );
}
