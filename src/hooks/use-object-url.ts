"use client";

import { useEffect, useMemo } from "react";

/** Object URL for a picked file, revoked whenever the file changes. */
export function useObjectUrl(file: File | null) {
  const url = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
