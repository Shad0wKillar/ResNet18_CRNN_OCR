"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cpu,
  ImageUp,
  Loader2,
  RotateCcw,
  ScanText,
  Server,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/button";
import { ImageDropzone } from "@/components/image-dropzone";
import { OcrResultPanel } from "@/components/ocr-result-panel";
import { SampleGallery } from "@/components/sample-gallery";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOcrPrediction } from "@/hooks/use-ocr-prediction";

export default function Home() {
  const {
    file,
    result,
    isLoading,
    error,
    handleFileSelect,
    resetPrediction,
    submitImage,
  } = useOcrPrediction();
  const [showWarmupMessage, setShowWarmupMessage] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const timer = window.setTimeout(() => {
      setShowWarmupMessage(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isLoading]);

  const fileSummary = useMemo(() => {
    if (!file) return "No image selected";
    return `${file.type || "image"} - ${(file.size / 1024 / 1024).toFixed(
      2,
    )} MB`;
  }, [file]);

  const loadingMessage = showWarmupMessage
    ? "The Hugging Face Space may be waking up. Keeping the request open..."
    : "Running OCR inference...";

  const runPrediction = () => {
    setShowWarmupMessage(false);
    void submitImage();
  };

  const resetAll = () => {
    setShowWarmupMessage(false);
    resetPrediction();
  };

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
                OCR inference console
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

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <section className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live OCR
                </div>
                <div>
                  <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                    ResNet18-CRNN-OCR
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    Upload an image or pick one of the samples, then run
                    recognition through your Hugging Face inference endpoint.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
                <Cpu className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                <p className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  ResNet18
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Encoder
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
                <ScanText className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <p className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  CRNN
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sequence decoder
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
                <Server className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                <p className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Space
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Remote inference
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                  Input image
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {fileSummary}
                </p>
              </div>
              <ImageUp className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>

            <ImageDropzone
              onFileSelect={handleFileSelect}
              selectedFile={file}
            />

            <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <SampleGallery
                disabled={isLoading}
                onSampleSelect={handleFileSelect}
                selectedFileName={file?.name ?? null}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <Button
                className="w-full"
                disabled={!file || isLoading}
                onClick={runPrediction}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanText className="h-4 w-4" />
                )}
                {isLoading ? "Recognizing..." : "Recognize text"}
              </Button>

              <Button
                disabled={!file && !result && !error}
                onClick={resetAll}
                variant="secondary"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900/90">
          <OcrResultPanel
            error={error}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            result={result}
          />
        </section>
      </div>
    </main>
  );
}
