"use client";

import type { VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import type { buttonVariants } from "@/components/ui/button";
import {
  ThemeToggleButton,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";

export function ThemeToggler(
  props: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>,
) {
  const { theme, setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  const handleThemeToggle = useCallback(() => {
    startTransition(() => setTheme((prev) => (prev === "light" ? "dark" : "light")));
  }, [setTheme, startTransition]);

  return (
    <ThemeToggleButton
      theme={theme as "light" | "dark" | undefined}
      onClick={handleThemeToggle}
      variant="circle"
      start="top-left"
      className="bg-transparent hover:bg-secondary/80 rounded-full border-0 shadow-none"
    />
  );
}
