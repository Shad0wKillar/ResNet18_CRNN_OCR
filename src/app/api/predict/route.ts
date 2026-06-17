import { randomUUID } from "node:crypto";
import { resolve4 } from "node:dns/promises";
import * as http from "node:http";
import * as https from "node:https";
import { NextResponse } from "next/server";

const HF_OCR_ENDPOINT =
  process.env.HF_OCR_ENDPOINT ?? "https://shad0wkillar-ocr.hf.space/predict";

export const runtime = "nodejs";
export const maxDuration = 60;

type UpstreamResponse = {
  body: string;
  contentType: string;
  status: number;
};

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function resolvePublicIpv4(hostname: string) {
  try {
    const addresses = await resolve4(hostname);
    return addresses.find((address) => !isPrivateIpv4(address)) ?? addresses[0];
  } catch {
    return undefined;
  }
}

function sanitizeFilename(filename: string) {
  return filename.replace(/["\r\n\\/]/g, "_") || "ocr-input.png";
}

async function postFileToOcrEndpoint(file: File): Promise<UpstreamResponse> {
  const endpoint = new URL(HF_OCR_ENDPOINT);
  const boundary = `----resnet18-crnn-ocr-${randomUUID()}`;
  const filename = sanitizeFilename(file.name);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  const prefix = Buffer.from(
    [
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${filename}"`,
      `Content-Type: ${contentType}`,
      "",
      "",
    ].join("\r\n"),
  );
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([prefix, fileBuffer, suffix]);

  const publicAddress = await resolvePublicIpv4(endpoint.hostname);
  const isHttps = endpoint.protocol === "https:";
  const transport = isHttps ? https : http;
  const hostname = publicAddress ?? endpoint.hostname;

  const requestOptions: https.RequestOptions = {
    protocol: endpoint.protocol,
    hostname,
    port: endpoint.port || (isHttps ? 443 : 80),
    path: `${endpoint.pathname}${endpoint.search}`,
    method: "POST",
    headers: {
      accept: "application/json",
      "content-length": body.length,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      host: endpoint.host,
    },
  };

  if (isHttps) {
    requestOptions.servername = endpoint.hostname;
  }

  return new Promise((resolve, reject) => {
    const req = transport.request(requestOptions, (res) => {
      const chunks: Buffer[] = [];

      res.on("data", (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      res.on("end", () => {
        const header = res.headers["content-type"];
        const responseContentType = Array.isArray(header)
          ? header[0]
          : (header ?? "application/json");

        resolve({
          body: Buffer.concat(chunks).toString("utf8"),
          contentType: responseContentType,
          status: res.statusCode ?? 502,
        });
      });
    });

    req.setTimeout(60_000, () => {
      req.destroy(new Error("OCR request timed out after 60 seconds."));
    });

    req.on("error", reject);
    req.end(body);
  });
}

function getErrorDetail(error: unknown) {
  if (!(error instanceof Error)) return String(error);

  const cause =
    "cause" in error && error.cause instanceof Error
      ? ` (${error.cause.message})`
      : "";

  return `${error.message}${cause}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Expected an uploaded image in the `file` form field." },
        { status: 400 },
      );
    }

    const response = await postFileToOcrEndpoint(file);

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to reach the OCR inference service.",
        detail: getErrorDetail(error),
      },
      { status: 500 },
    );
  }
}
