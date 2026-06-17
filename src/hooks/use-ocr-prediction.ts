"use client";

import { useState } from "react";
import {
  extractOcrText,
  getPayloadError,
  type NormalizedOcrResult,
  type OcrPayload,
} from "@/lib/ocr";

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

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const resetPrediction = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  const submitImage = async () => {
    if (!file || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const payload = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(getPayloadError(payload, response.status));
      }

      setResult({
        raw: payload,
        text: extractOcrText(payload),
        fileName: file.name,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during OCR inference.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    result,
    isLoading,
    error,
    handleFileSelect,
    resetPrediction,
    submitImage,
  };
}
