#!/usr/bin/env node
/**
 * preToolUse — targeted policy checks for Linaw scaffold boundaries.
 *
 * Deny only clear violations that compete with the workflow:
 * - loose files directly under spec/ (except AGENTS.md)
 * - app/api routes other than the single adapt POST handler
 * - a second adaptation module beside the known lib/adapt files
 * - UI importing fixture.ts directly
 *
 * Everything else is allowed (fail open) so parallel shell/track work is not blocked.
 */
"use strict";

const ALLOWED_ADAPT_FILES = new Set([
  "port.ts",
  "index.ts",
  "fixture.ts",
  "http.ts",
]);

/** Only API route allowed in this scaffold. */
const ALLOWED_API_ROUTE = "app/api/adapt/route.ts";

function readStdin() {
  try {
    return require("fs").readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function allow() {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
}

function deny(agentMessage, userMessage) {
  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      agent_message: agentMessage,
      user_message: userMessage || agentMessage,
    }),
  );
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
      toolInput.uri ||
      "",
  );
}

function extractContents(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return "";
  const parts = [
    toolInput.contents,
    toolInput.content,
    toolInput.new_string,
    toolInput.old_string,
  ];
  return parts.filter((x) => typeof x === "string").join("\n");
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
  // Already relative or cwd-relative
  return p.replace(/^\.\//, "");
}

function isWriteLike(toolName) {
  const t = String(toolName || "");
  return /^(Write|StrReplace|Delete|EditNotebook)$/i.test(t);
}

function checkLooseSpec(rel) {
  // Direct child of spec/: only AGENTS.md allowed
  const m = rel.match(/^spec\/([^/]+)$/i);
  if (!m) return null;
  if (m[1].toLowerCase() === "agents.md") return null;
  return {
    agent:
      "Blocked: loose file under `spec/`. The only file allowed directly in `spec/` is `AGENTS.md`. Put phase work in a folder named `spec-NN-short_name` (see `spec/AGENTS.md`).",
    user: "Linaw policy: do not create loose files in spec/ — use a numbered phase folder.",
  };
}

function checkAppApi(rel) {
  if (!/^app\/api(\/|$)/i.test(rel)) return null;
  if (rel.toLowerCase() === ALLOWED_API_ROUTE) return null;
  return {
    agent:
      "Blocked: only `app/api/adapt/route.ts` is allowed under `app/api`. UI still calls `adapt()` from `lib/adapt` (selector may use `http.ts`). Do not add other API routes.",
    user: "Linaw policy: only app/api/adapt/route.ts is allowed.",
  };
}

function checkSecondAdaptPath(rel) {
  const m = rel.match(/^lib\/adapt\/([^/]+)$/i);
  if (!m) return null;
  const file = m[1];
  if (ALLOWED_ADAPT_FILES.has(file)) return null;
  // Allow non-code helpers only if clearly not a parallel adapt entry (deny *.ts/*.js/*.mjs)
  if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(file)) return null;
  return {
    agent:
      `Blocked: \`${rel}\` looks like a second adaptation path. Allowed files under \`lib/adapt/\` are: port.ts, index.ts, fixture.ts, and (later) http.ts. Callers use \`adapt()\` from \`lib/adapt\` only — see docs/AGENTS.md and docs/ai-workflow.md.`,
    user: "Linaw policy: do not add another adaptation module beside lib/adapt.",
  };
}

function checkDirectFixtureImport(rel, contents) {
  if (!contents) return null;
  // index.ts is the only selector allowed to import fixture
  if (/^lib\/adapt\/index\.ts$/i.test(rel)) return null;
  if (/^lib\/adapt\/fixture\.ts$/i.test(rel)) return null;
  const importsFixture =
    /from\s+['"][^'"]*adapt\/fixture['"]/.test(contents) ||
    /require\(\s*['"][^'"]*adapt\/fixture['"]\s*\)/.test(contents);
  if (!importsFixture) return null;
  return {
    agent:
      "Blocked: do not import `lib/adapt/fixture` from UI or other modules. Call `adapt()` from `lib/adapt` (the selector in `index.ts`). Direct fixture imports create a second adaptation path.",
    user: "Linaw policy: call adapt() from lib/adapt — never import fixture.ts directly.",
  };
}

function main() {
  let raw = readStdin();
  let input;
  try {
    input = raw ? JSON.parse(raw) : {};
  } catch {
    allow();
    return;
  }

  const toolName = input.tool_name || "";
  if (!isWriteLike(toolName)) {
    allow();
    return;
  }

  const toolInput = input.tool_input || {};
  const rel = repoRelative(extractPath(toolInput));
  if (!rel) {
    allow();
    return;
  }

  // Delete of disallowed paths still matters
  const checks = [checkLooseSpec(rel), checkAppApi(rel), checkSecondAdaptPath(rel)];

  if (!/^Delete$/i.test(toolName)) {
    checks.push(checkDirectFixtureImport(rel, extractContents(toolInput)));
  }

  for (const hit of checks) {
    if (hit) {
      deny(hit.agent, hit.user);
      return;
    }
  }

  allow();
}

try {
  main();
} catch {
  allow();
}
