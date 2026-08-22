"use client";

import { useEffect, useRef } from "react";
import { Cpu, ScanText, Server, Sparkles } from "lucide-react";
import { ImageDropzone } from "@/components/image-dropzone";
import { OcrResultPanel } from "@/components/ocr-result-panel";
import { SampleGallery } from "@/components/sample-gallery";
import { ThemeToggle } from "@/components/theme-toggle";
import { useObjectUrl } from "@/hooks/use-object-url";
import { useOcrPrediction } from "@/hooks/use-ocr-prediction";

const CHIPS = [
  { icon: Cpu, label: "ResNet18 encoder" },
  { icon: ScanText, label: "CRNN decoder" },
  { icon: Server, label: "Hugging Face Space" },
];

export default function Home() {
  const { file, result, error, status, selectFile, rerun, cancelRun, reset } =
    useOcrPrediction();
  const previewUrl = useObjectUrl(file);
  const resultRef = useRef<HTMLElement>(null);

  // Stacked layouts put the output below the fold, so follow the run down.
  useEffect(() => {
    if (status !== "running") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status]);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-zinc-950 transition-colors dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/85 backdrop-blur transition-colors dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
              <ScanText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                ResNet18-CRNN-OCR
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                Handwriting recognition demo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200 sm:flex">
              <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-300" />
              HF Space
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Live OCR
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
            Read handwriting in one click
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Pick a sample line or drop in your own image. Recognition starts the
            moment you choose one.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHIPS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300"
              >
                <Icon className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
                1
              </span>
              <div>
                <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                  Choose an image
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Click a sample to run it instantly
                </p>
              </div>
            </div>

            <SampleGallery
              onSampleSelect={selectFile}
              selectedFileName={file?.name ?? null}
            />

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                or
              </span>
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <ImageDropzone onFileSelect={selectFile} />
          </section>

          <section
            ref={resultRef}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-colors lg:sticky lg:top-6 dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <OcrResultPanel
              error={error}
              fileName={file?.name ?? null}
              onCancel={cancelRun}
              onClear={reset}
              onRerun={rerun}
              previewUrl={previewUrl}
              result={result}
              status={status}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
