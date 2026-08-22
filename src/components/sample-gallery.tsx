"use client";

import { useState } from "react";
import { Check, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SAMPLE_IMAGES,
  fetchSampleFile,
  sampleUrl,
  type SampleImage,
} from "@/lib/samples";

type SampleGalleryProps = {
  /** Name of the staged file, used to mark the active sample. */
  selectedFileName: string | null;
  onSampleSelect: (file: File) => void;
};

export function SampleGallery({
  selectedFileName,
  onSampleSelect,
}: SampleGalleryProps) {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickSample = async (sample: SampleImage) => {
    if (loadingFile) return;

    setLoadingFile(sample.file);
    setError(null);

    try {
      onSampleSelect(await fetchSampleFile(sample));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load sample image.",
      );
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        {SAMPLE_IMAGES.map((sample, index) => {
          const isSelected = selectedFileName === sample.file;
          const isLoading = loadingFile === sample.file;

          return (
            <button
              key={sample.file}
              type="button"
              aria-label={`Run OCR on ${sample.label}`}
              aria-pressed={isSelected}
              disabled={Boolean(loadingFile)}
              onClick={() => void pickSample(sample)}
              className={cn(
                "group flex items-center gap-3 rounded-lg border bg-white px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 dark:bg-zinc-950/70 dark:focus-visible:ring-teal-300 dark:focus-visible:ring-offset-zinc-950",
                isSelected
                  ? "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-400/10"
                  : "border-zinc-200 hover:border-teal-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-teal-400 dark:hover:bg-zinc-900",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                  isSelected
                    ? "border-teal-500 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-zinc-950"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 group-hover:border-teal-500 group-hover:bg-teal-600 group-hover:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:group-hover:border-teal-400 dark:group-hover:bg-teal-400 dark:group-hover:text-zinc-950",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSelected ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <>
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play className="hidden h-3 w-3 fill-current group-hover:block" />
                  </>
                )}
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sampleUrl(sample)}
                alt={sample.label}
                loading="lazy"
                className="h-10 min-w-0 flex-1 object-contain object-left dark:opacity-90"
              />
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
