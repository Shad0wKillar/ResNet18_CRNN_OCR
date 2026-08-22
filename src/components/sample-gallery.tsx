"use client";

import { useState } from "react";
import { Images, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SAMPLE_IMAGES,
  fetchSampleFile,
  sampleUrl,
  type SampleImage,
} from "@/lib/samples";

type SampleGalleryProps = {
  /** Name of the currently selected file, used to highlight the active sample. */
  selectedFileName: string | null;
  disabled?: boolean;
  onSampleSelect: (file: File) => void;
};

export function SampleGallery({
  selectedFileName,
  disabled = false,
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Or try a sample
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pick a handwriting line to run without uploading your own image.
          </p>
        </div>
        <Images className="h-5 w-5 shrink-0 text-zinc-400 dark:text-zinc-500" />
      </div>

      <div className="grid gap-2">
        {SAMPLE_IMAGES.map((sample) => {
          const isSelected = selectedFileName === sample.file;
          const isLoading = loadingFile === sample.file;

          return (
            <button
              key={sample.file}
              type="button"
              aria-label={`Use ${sample.label}`}
              aria-pressed={isSelected}
              disabled={disabled || Boolean(loadingFile)}
              onClick={() => void pickSample(sample)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg border bg-white px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 dark:bg-zinc-950/70 dark:focus-visible:ring-teal-300 dark:focus-visible:ring-offset-zinc-950",
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
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  sample.label.replace(/\D/g, "")
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
