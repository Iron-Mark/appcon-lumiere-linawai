"use client";

/**
 * Client-only source file readers for the Read composer.
 * No network upload — files stay in the browser.
 */

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_SOURCE_CHARS = 20_000;
const MAX_PDF_PAGES = 30;

const ALLOWED_EXTENSIONS = new Set([".txt", ".text", ".md", ".pdf"]);
const TEXT_EXTENSIONS = new Set([".txt", ".text", ".md"]);
const ALLOWED_MIME = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "application/pdf",
  "application/x-pdf",
  "",
  "application/octet-stream",
]);

export type SourceFileResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

function extensionOf(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? name;
  const dot = base.lastIndexOf(".");
  if (dot < 0) return "";
  return base.slice(dot).toLowerCase();
}

export function sanitizeSourceText(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * Turn a raw .txt or .md notice into the prose the reader and the model share.
 * Markup and mid-sentence wraps come out as sentences. Words stay.
 */
export function toPlainSource(raw: string): string {
  let text = sanitizeSourceText(raw);
  text = text.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""));
  text = text.replace(/!\[[^\]]*]\([^)]*\)/g, "");
  text = text.replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^\s{0,3}>\s?/gm, "");
  text = text.replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(^|[\s])\*([^*\n]+)\*(?=[\s]|$)/g, "$1$2");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/^\s*-{3,}\s*$/gm, "");

  const lines = text.split("\n");
  const merged: string[] = [];
  for (const line of lines) {
    const current = line.trim();
    if (!current) {
      merged.push("");
      continue;
    }
    const previous = merged.length > 0 ? merged[merged.length - 1]! : "";
    if (previous && !/[.!?:"']$/.test(previous) && /^[a-z(]/.test(current)) {
      merged[merged.length - 1] = `${previous} ${current}`;
    } else {
      merged.push(current);
    }
  }

  return merged.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function enforceSourceLength(text: string): SourceFileResult {
  const cleaned = sanitizeSourceText(text);
  if (!cleaned.trim()) {
    return { ok: false, error: "No readable text was found in that file." };
  }
  if (cleaned.length > MAX_SOURCE_CHARS) {
    return {
      ok: false,
      error: `That text is too long. Keep it under ${MAX_SOURCE_CHARS.toLocaleString()} characters.`,
    };
  }
  return { ok: true, text: cleaned };
}

function validateFileMeta(file: File): SourceFileResult | null {
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: "That file is too large. Use a file under 2 MB.",
    };
  }
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      error: "Use a .txt, .md, or .pdf file.",
    };
  }
  const mime = (file.type || "").toLowerCase();
  if (mime && !ALLOWED_MIME.has(mime)) {
    if (TEXT_EXTENSIONS.has(ext) && !mime.startsWith("text/")) {
      return { ok: false, error: "Use a .txt, .md, or .pdf file." };
    }
    if (ext === ".pdf" && mime !== "application/pdf" && mime !== "application/x-pdf") {
      return { ok: false, error: "Use a .txt, .md, or .pdf file." };
    }
  }
  return null;
}

async function readTextFile(file: File): Promise<SourceFileResult> {
  try {
    const raw = await file.text();
    return enforceSourceLength(toPlainSource(raw));
  } catch {
    return { ok: false, error: "Could not read that file." };
  }
}

async function extractPdfText(file: File): Promise<SourceFileResult> {
  try {
    const pdfjs = await import("pdfjs-dist");
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    }

    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({
      data,
      disableAutoFetch: true,
      disableStream: true,
      disableRange: true,
      isEvalSupported: false,
      useSystemFonts: true,
      // Do not follow remote font/cmap URLs.
      cMapUrl: undefined,
      standardFontDataUrl: undefined,
    });

    const pdf = await loadingTask.promise;
    if (pdf.numPages > MAX_PDF_PAGES) {
      await pdf.destroy();
      return {
        ok: false,
        error: `That PDF has too many pages. Use one with ${MAX_PDF_PAGES} pages or fewer.`,
      };
    }

    const parts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent({
        includeMarkedContent: false,
      });
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      if (pageText.trim()) parts.push(pageText);
      page.cleanup();
    }
    await pdf.destroy();

    return enforceSourceLength(parts.join("\n\n"));
  } catch {
    return { ok: false, error: "Could not read text from that PDF." };
  }
}

/** Read one local text or PDF file into sanitized draft text. */
export async function readSourceFile(file: File): Promise<SourceFileResult> {
  const metaError = validateFileMeta(file);
  if (metaError) return metaError;

  const ext = extensionOf(file.name);
  if (ext === ".pdf") return extractPdfText(file);
  return readTextFile(file);
}

export const SOURCE_UPLOAD_ACCEPT = ".txt,.text,.md,.pdf,text/plain,text/markdown,application/pdf";
export const SOURCE_UPLOAD_LIMITS_ID = "source-upload-limits";
export const SOURCE_UPLOAD_LIMITS_TEXT =
  "Text or PDF, one file, under 2 MB. PDF text only, up to 30 pages.";
