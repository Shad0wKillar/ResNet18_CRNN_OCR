export type OcrPayload = unknown;

export type NormalizedOcrResult = {
  raw: OcrPayload;
  text: string;
  fileName: string;
  completedAt: string;
};

const TEXT_KEYS = [
  "text",
  "prediction",
  "predicted_text",
  "recognized_text",
  "ocr_text",
  "transcription",
  "result",
  "output",
  "label",
  "value",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringifyFallback(value: unknown) {
  if (value == null) return "";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function findTextCandidate(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const stringItems = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    if (stringItems.length > 0) {
      return stringItems.join("\n");
    }

    for (const item of value) {
      const candidate = findTextCandidate(item, depth + 1);
      if (candidate) return candidate;
    }
  }

  if (isRecord(value)) {
    for (const key of TEXT_KEYS) {
      if (key in value) {
        const candidate = findTextCandidate(value[key], depth + 1);
        if (candidate) return candidate;
      }
    }

    for (const nested of Object.values(value)) {
      const candidate = findTextCandidate(nested, depth + 1);
      if (candidate) return candidate;
    }
  }

  return null;
}

export function extractOcrText(payload: OcrPayload) {
  return findTextCandidate(payload) ?? stringifyFallback(payload);
}

export function formatRawPayload(payload: OcrPayload) {
  if (typeof payload === "string") return payload;
  return stringifyFallback(payload);
}

export function getPayloadError(payload: OcrPayload, status: number) {
  if (typeof payload === "string" && payload.trim()) return payload;

  if (isRecord(payload)) {
    const message =
      payload.error ?? payload.detail ?? payload.message ?? payload.reason;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `OCR request failed with status ${status}.`;
}
