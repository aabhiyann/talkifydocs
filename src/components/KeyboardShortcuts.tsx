"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  modifier?: "ctrl" | "cmd" | "alt" | "shift";
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toast } = useToast();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      description: "Search documents",
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      modifier: "cmd",
    },
    {
      key: "n",
      description: "Upload new document",
      action: () => {
        const uploadButton = document.querySelector('[data-upload-trigger]') as HTMLButtonElement;
        if (uploadButton) {
          uploadButton.click();
        }
      },
      modifier: "cmd",
    },
    {
      key: "h",
      description: "Go to home",
      action: () => router.push("/"),
      modifier: "cmd",
    },
    {
      key: "d",
      description: "Go to dashboard",
      action: () => router.push("/dashboard"),
      modifier: "cmd",
    },
    {
      key: "p",
      description: "Go to pricing",
      action: () => router.push("/pricing"),
      modifier: "cmd",
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => {
        toast({
          title: "Keyboard Shortcuts",
          description: "Press Cmd+K to search, Cmd+N to upload, Cmd+H for home, Cmd+D for dashboard, Cmd+P for pricing",
        });
      },
    },
    {
      key: "Escape",
      description: "Close modals/dropdowns",
      action: () => {
        // Close any open modals or dropdowns
        const modals = document.querySelectorAll('[role="dialog"]');
        const dropdowns = document.querySelectorAll('[data-state="open"]');
        
        [...modals, ...dropdowns].forEach((element) => {
          const closeButton = element.querySelector('[aria-label="Close"], [data-close]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        });
      },
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmd = isMac ? event.metaKey : event.ctrlKey;
      const isAlt = event.altKey;
      const isShift = event.shiftKey;

      for (const shortcut of shortcuts) {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const modifierMatches = 
          (!shortcut.modifier && !isCmd && !isAlt && !isShift) ||
          (shortcut.modifier === "cmd" && isCmd && !isAlt && !isShift) ||
          (shortcut.modifier === "alt" && isAlt && !isCmd && !isShift) ||
          (shortcut.modifier === "shift" && isShift && !isCmd && !isAlt);

        if (keyMatches && modifierMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

export function KeyboardShortcutsModal() {
  const shortcuts = useKeyboardShortcuts();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
      <div className="grid grid-cols-1 gap-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{shortcut.description}</span>
            <div className="flex items-center space-x-1">
              {shortcut.modifier && (
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">
                  {shortcut.modifier === "cmd" ? "⌘" : shortcut.modifier.toUpperCase()}
                </kbd>
              )}
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">
                {shortcut.key}
              </kbd>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
