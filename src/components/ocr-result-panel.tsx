"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  MousePointerClick,
  RotateCcw,
  ScanText,
  Square,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/button";
import { formatRawPayload, type NormalizedOcrResult } from "@/lib/ocr";
import type { OcrStatus } from "@/hooks/use-ocr-prediction";

type OcrResultPanelProps = {
  status: OcrStatus;
  result: NormalizedOcrResult | null;
  error: string | null;
  previewUrl: string | null;
  fileName: string | null;
  onRerun: () => void;
  onCancel: () => void;
  onClear: () => void;
};

const STEPS = [
  "Pick a sample line or upload an image",
  "The model runs on its own — no button to hunt for",
  "Copy the transcription from here",
];

const STATUS_LABEL: Record<OcrStatus, string> = {
  idle: "Waiting for an image",
  running: "Reading the image",
  ready: "Run stopped",
  done: "Transcription ready",
  error: "Run failed",
};

function InputPreview({
  previewUrl,
  fileName,
}: {
  previewUrl: string | null;
  fileName: string | null;
}) {
  if (!previewUrl) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Input
        </span>
        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {fileName}
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Image being recognized"
        className="max-h-24 w-full object-contain object-left dark:opacity-90"
      />
    </div>
  );
}

/** Owns its own elapsed timer; remounted per run so the count restarts. */
function RunningState({
  previewUrl,
  fileName,
}: {
  previewUrl: string | null;
  fileName: string | null;
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <InputPreview fileName={fileName} previewUrl={previewUrl} />

      <div className="flex-1 rounded-lg border border-zinc-200 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="flex items-center gap-3">
          <ScanText className="h-4 w-4 animate-pulse text-teal-700 dark:text-teal-300" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Reading the handwriting&hellip;
          </p>
          <span className="ml-auto text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
            {seconds}s
          </span>
        </div>

        <div className="mt-4 space-y-2.5" aria-hidden>
          <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-9/12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-6/12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {seconds >= 5 ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
            The Hugging Face Space may be waking up from sleep. Keeping the
            request open&hellip;
          </p>
        ) : null}
      </div>
    </>
  );
}

export function OcrResultPanel({
  status,
  result,
  error,
  previewUrl,
  fileName,
  onRerun,
  onCancel,
  onClear,
}: OcrResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const text = result?.text.trim() ?? "";
  const rawPayload = useMemo(
    () => (result ? formatRawPayload(result.raw) : ""),
    [result],
  );
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const copyText = async () => {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-[480px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 transition-colors dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span
            className={
              status === "done"
                ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-sm font-semibold text-white dark:bg-teal-400 dark:text-zinc-950"
                : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-50 text-sm font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-400"
            }
          >
            {status === "done" ? <Check className="h-4 w-4" /> : "2"}
          </span>
          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Recognized text
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {STATUS_LABEL[status]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "running" ? (
            <Button onClick={onCancel} variant="secondary">
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop
            </Button>
          ) : null}

          {status === "done" ? (
            <Button onClick={onRerun} variant="secondary">
              <RotateCcw className="h-4 w-4" />
              Run again
            </Button>
          ) : null}

          {text ? (
            <Button onClick={copyText}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy text"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <AnimatePresence initial={false} mode="wait">
          {status === "running" ? (
            <motion.div
              key={`running-${fileName ?? ""}`}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-4"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <RunningState fileName={fileName} previewUrl={previewUrl} />
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              key="error"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-4"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <InputPreview fileName={fileName} previewUrl={previewUrl} />

              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold">Recognition failed</p>
                  <p>{error}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={onRerun}>
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </Button>
                <Button onClick={onClear} variant="secondary">
                  <Trash2 className="h-4 w-4" />
                  Pick another image
                </Button>
              </div>
            </motion.div>
          ) : status === "ready" ? (
            <motion.div
              key="ready"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-4"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <InputPreview fileName={fileName} previewUrl={previewUrl} />

              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center transition-colors dark:border-zinc-700 dark:bg-zinc-950/70">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  You stopped the run before it finished.
                </p>
                <Button onClick={onRerun}>
                  <ScanText className="h-4 w-4" />
                  Read this image
                </Button>
              </div>
            </motion.div>
          ) : status === "done" && result ? (
            <motion.div
              key="done"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-4"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <InputPreview fileName={fileName} previewUrl={previewUrl} />

              <div className="flex flex-1 flex-col justify-center rounded-lg border border-teal-200 bg-teal-50/60 p-5 transition-colors dark:border-teal-400/30 dark:bg-teal-400/5">
                {text ? (
                  <p className="text-xl font-medium leading-8 tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl">
                    {text}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    The response did not include readable text.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span>{text.length} characters</span>
                <span>
                  Finished{" "}
                  {new Date(result.completedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md px-1 font-medium text-zinc-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>

              <details className="rounded-lg border border-zinc-200 bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
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
              key="idle"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-5 py-6 text-center"
              exit={{ opacity: 0, y: -8 }}
              initial={false}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                <MousePointerClick className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                  Nothing read yet
                </p>
                <p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
                  Choose an image on the left and the transcription shows up
                  here.
                </p>
              </div>

              <ol className="w-full max-w-sm space-y-2 text-left">
                {STEPS.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
