"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/button";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "resnet18-crnn-ocr-theme";

function applyTheme(theme: Theme, persist = true) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;

  if (persist) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

export function ThemeToggle() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      aria-label="Toggle color theme"
      className="h-10 w-10 px-0"
      onClick={toggleTheme}
      title="Toggle color theme"
      variant="secondary"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}
