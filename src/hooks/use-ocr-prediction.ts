"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  extractOcrText,
  getPayloadError,
  type NormalizedOcrResult,
  type OcrPayload,
} from "@/lib/ocr";

/**
 * `ready` is only reachable by cancelling a run: an image is staged but no
 * request is in flight, so the UI offers an explicit re-run.
 */
export type OcrStatus = "idle" | "running" | "ready" | "done" | "error";

async function readResponsePayload(response: Response): Promise<OcrPayload> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function useOcrPrediction() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<NormalizedOcrResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const runOcr = useCallback(async (target: File) => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    const runId = ++runIdRef.current;
    const isCurrent = () => runId === runIdRef.current;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", target);

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const payload = await readResponsePayload(response);

      if (!isCurrent()) return;

      if (!response.ok) {
        throw new Error(getPayloadError(payload, response.status));
      }

      setResult({
        raw: payload,
        text: extractOcrText(payload),
        fileName: target.name,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      if (!isCurrent() || controller.signal.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during OCR inference.",
      );
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, []);

  /** Staging an image immediately runs it — there is no separate submit step. */
  const selectFile = useCallback(
    (next: File | null) => {
      controllerRef.current?.abort();
      runIdRef.current += 1;

      setFile(next);
      setResult(null);
      setError(null);

      if (!next) {
        setIsLoading(false);
        return;
      }

      void runOcr(next);
    },
    [runOcr],
  );

  const rerun = useCallback(() => {
    if (file) void runOcr(file);
  }, [file, runOcr]);

  const cancelRun = useCallback(() => {
    controllerRef.current?.abort();
    runIdRef.current += 1;
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    runIdRef.current += 1;

    setFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const status: OcrStatus = isLoading
    ? "running"
    : error
      ? "error"
      : result
        ? "done"
        : file
          ? "ready"
          : "idle";

  return {
    file,
    result,
    error,
    status,
    selectFile,
    rerun,
    cancelRun,
    reset,
  };
}
