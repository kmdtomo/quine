"use client";

import { useEffect, useRef } from "react";

type KeyboardShortcutOptions = {
  altKey?: boolean;
  enabled?: boolean;
  key: string;
  metaOrControl?: boolean;
  onTrigger: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  shiftKey?: boolean;
};

export function useKeyboardShortcut({
  altKey = false,
  enabled = true,
  key,
  metaOrControl = false,
  onTrigger,
  preventDefault = true,
  shiftKey = false,
}: KeyboardShortcutOptions) {
  const onTriggerRef = useRef(onTrigger);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const normalizedKey = key.toLowerCase();

    function handleKeyDown(event: KeyboardEvent) {
      const modifierPressed = event.metaKey || event.ctrlKey;

      if (
        event.key.toLowerCase() !== normalizedKey ||
        event.altKey !== altKey ||
        event.shiftKey !== shiftKey ||
        modifierPressed !== metaOrControl
      ) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }
      onTriggerRef.current(event);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [altKey, enabled, key, metaOrControl, preventDefault, shiftKey]);
}
