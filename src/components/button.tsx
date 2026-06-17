import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-teal-700 bg-teal-700 text-white shadow-sm hover:bg-teal-800 focus-visible:ring-teal-600 disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-500 dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 dark:focus-visible:ring-teal-300 dark:disabled:border-zinc-800 dark:disabled:bg-zinc-950/70 dark:disabled:text-zinc-600",
  secondary:
    "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:ring-zinc-400 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 dark:disabled:text-zinc-600",
  ghost:
    "border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none",
        "dark:focus-visible:ring-offset-zinc-950",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
