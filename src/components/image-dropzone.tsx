"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileImage, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

type ImageDropzoneProps = {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function ImageDropzone({
  selectedFile,
  onFileSelect,
}: ImageDropzoneProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const preview = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) return;

      setLocalError(null);
      onFileSelect(nextFile);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      onDropRejected: (rejections) => {
        const message =
          rejections[0]?.errors[0]?.message ?? "Unsupported image file.";
        setLocalError(message);
      },
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/bmp": [".bmp"],
      },
      maxFiles: 1,
      maxSize: MAX_FILE_SIZE,
    });

  const clearFile = (event: React.MouseEvent) => {
    event.stopPropagation();
    setLocalError(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex min-h-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-white transition-colors dark:bg-zinc-950/70",
          isDragActive &&
            "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-400/10",
          isDragReject &&
            "border-red-400 bg-red-50 dark:border-red-400 dark:bg-red-400/10",
          !isDragActive &&
            !isDragReject &&
            "border-zinc-300 hover:border-teal-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-teal-400 dark:hover:bg-zinc-900",
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Selected OCR input"
              className="h-full max-h-[360px] w-full object-contain p-3"
            />
            <div className="pointer-events-none absolute inset-3 rounded-md border border-teal-500/30 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.12)] dark:border-teal-300/30" />
            <div className="pointer-events-none absolute left-3 right-3 top-1/2 h-px bg-teal-400/70 shadow-[0_0_20px_rgba(20,184,166,0.75)] dark:bg-teal-300/70" />
            <Button
              aria-label="Clear selected image"
              className="absolute right-3 top-3 h-9 w-9 p-0"
              onClick={clearFile}
              variant="secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-4 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-teal-700 transition-colors group-hover:border-teal-200 group-hover:bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-teal-300 dark:group-hover:border-teal-500/50 dark:group-hover:bg-teal-500/10">
              {isDragActive ? (
                <FileImage className="h-7 w-7" />
              ) : (
                <UploadCloud className="h-7 w-7" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {isDragActive ? "Drop image" : "Image file"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                JPEG, PNG, WebP, or BMP up to 8 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFile ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950/70">
          <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
            {selectedFile.name}
          </span>
          <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      ) : null}

      {localError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
