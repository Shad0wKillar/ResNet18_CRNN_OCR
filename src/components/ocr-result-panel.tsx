"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Copy,
  FileText,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/button";
import { formatRawPayload, type NormalizedOcrResult } from "@/lib/ocr";

type OcrResultPanelProps = {
  result: NormalizedOcrResult | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
};

export function OcrResultPanel({
  result,
  isLoading,
  error,
  loadingMessage,
}: OcrResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const text = result?.text.trim() ?? "";
  const rawPayload = useMemo(
    () => (result ? formatRawPayload(result.raw) : ""),
    [result],
  );
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  const copyText = async () => {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-[520px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 transition-colors dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Recognition output
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {result ? result.fileName : "No result yet"}
            </p>
          </div>
        </div>

        <Button
          disabled={!text || isLoading}
          onClick={copyText}
          variant="secondary"
        >
          {copied ? (
            <Check className="h-4 w-4 text-teal-700" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <AnimatePresence initial={false} mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <p className="max-w-sm text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {loadingMessage}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-4"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/70">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Words
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {wordCount}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/70">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Characters
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {charCount}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/70">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Finished
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {new Date(result.completedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="min-h-56 flex-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                {text ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                    {text}
                  </pre>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    The response did not include readable text.
                  </p>
                )}
              </div>

              <details className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/70">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Raw response
                </summary>
                <pre className="max-h-64 overflow-auto border-t border-zinc-200 p-4 font-mono text-xs leading-5 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {rawPayload}
                </pre>
              </details>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                <Clipboard className="h-7 w-7" />
              </div>
              <p className="max-w-xs text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Awaiting OCR result.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
