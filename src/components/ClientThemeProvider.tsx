"use client";

import { useEffect, useState } from "react";

export default function ClientThemeProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Apply theme after component mounts to prevent hydration issues
    try {
      const theme = localStorage.getItem("talkifydocs-ui-theme") || "system";
      const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(isDark ? "dark" : "light");
    } catch (e) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  // Don't render anything during SSR to prevent hydration mismatches
  if (!mounted) {
    return null;
  }

  return null;
}
