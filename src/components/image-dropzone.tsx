"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileImage, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageDropzoneProps = {
  onFileSelect: (file: File) => void;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function ImageDropzone({ onFileSelect }: ImageDropzoneProps) {
  const [localError, setLocalError] = useState<string | null>(null);

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

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "group flex cursor-pointer items-center gap-4 rounded-lg border border-dashed px-4 py-4 transition-colors",
          isDragActive &&
            "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-400/10",
          isDragReject &&
            "border-red-400 bg-red-50 dark:border-red-400 dark:bg-red-400/10",
          !isDragActive &&
            !isDragReject &&
            "border-zinc-300 bg-white hover:border-teal-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950/70 dark:hover:border-teal-400 dark:hover:bg-zinc-900",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-teal-700 transition-colors group-hover:border-teal-200 group-hover:bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-teal-300 dark:group-hover:border-teal-500/50 dark:group-hover:bg-teal-500/10">
          {isDragActive ? (
            <FileImage className="h-5 w-5" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {isDragActive ? "Drop to run" : "Upload your own image"}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Drag and drop or click to browse &middot; JPEG, PNG, WebP, BMP up to
            8 MB
          </p>
        </div>
      </div>

      {localError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
