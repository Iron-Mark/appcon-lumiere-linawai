#!/usr/bin/env node
/**
 * postToolUse — non-blocking reminders after writes near guarded boundaries.
 * Never denies; injects additional_context only when useful.
 */
"use strict";

function readStdin() {
  try {
    return require("fs").readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function normalizePath(p) {
  return String(p || "").replace(/\\/g, "/");
}

function extractPath(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return "";
  return normalizePath(
    toolInput.path ||
      toolInput.file_path ||
      toolInput.target_notebook ||
      "",
  );
}

function repoRelative(absOrRel) {
  const p = normalizePath(absOrRel);
  const markers = [
    "/appcon-lumiere-linawai/",
    "appcon-lumiere-linawai/",
  ];
  for (const m of markers) {
    const i = p.toLowerCase().indexOf(m.toLowerCase());
    if (i !== -1) return p.slice(i + m.length);
  }
  return p.replace(/^\.\//, "");
}

function main() {
  let input;
  try {
    const raw = readStdin();
    input = raw ? JSON.parse(raw) : {};
  } catch {
    process.stdout.write("{}");
    return;
  }

  const toolName = String(input.tool_name || "");
  if (!/^(Write|StrReplace|Delete)$/i.test(toolName)) {
    process.stdout.write("{}");
    return;
  }

  const rel = repoRelative(extractPath(input.tool_input || {}));
  const notes = [];

  if (/^spec\//i.test(rel) && !/^spec\/agents\.md$/i.test(rel)) {
    if (!/^spec\/spec-\d{2}-[^/]+\//i.test(rel)) {
      notes.push(
        "Reminder: phase content belongs under `spec/spec-NN-short_name/`. Only `spec/AGENTS.md` may sit directly in `spec/`. See `spec/AGENTS.md`.",
      );
    }
  }

  if (/^lib\/adapt\//i.test(rel)) {
    notes.push(
      "Adapt seam: callers must use `adapt()` from `lib/adapt`. Only `index.ts` selects the implementation (`fixture` now; later `http.ts`). Fixture track owns `fixture.ts` content; do not invent another path.",
    );
  }

  if (/^app\/api(\/|$)/i.test(rel) || /\/api\/route\.(ts|js|tsx|jsx)$/i.test(rel)) {
    notes.push(
      "Only `app/api/adapt` exists. Do not add another route. Without a model key the handler stays on the fixture.",
    );
  }

  if (notes.length === 0) {
    process.stdout.write("{}");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      additional_context: ["## Linaw workflow nudge", "", ...notes].join("\n"),
    }),
  );
}

try {
  main();
} catch {
  process.stdout.write("{}");
}
