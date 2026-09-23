#!/usr/bin/env node
/**
 * sessionStart — point every new agent session at the durable Linaw guides.
 * Fail open: empty/invalid input still returns useful context.
 */
"use strict";

function readStdin() {
  try {
    return require("fs").readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

readStdin(); // consume input; sessionStart fields unused

const additional_context = [
  "## Linaw AI — session bootstrap",
  "",
  "Before editing code, read in this order:",
  "1. `docs/AGENTS.md` — agent rules, track ownership, non-negotiables",
  "2. `spec/AGENTS.md` — spec manager (only file allowed directly under `spec/`)",
  "3. `docs/ai-workflow.md` — durable AI development workflow (hooks, tracks, sample)",
  "4. Your phase folder — currently `spec/spec-01-initial_scaffold/`",
  "",
  "Product canon (do not rewrite): `docs/LINAW_AI_INITIAL-DRAFT_PROJECT_CONTEXT.md`.",
  "",
  "Hard constraints for this scaffold:",
  "- Single repo / one `package.json` (no monorepo).",
  "- No `app/api` routes. UI calls `adapt()` from `lib/adapt` only.",
  "- Do not invent a second adaptation path beside `lib/adapt`.",
  "- Do not put loose files directly in `spec/` (use `spec-NN-short_name/` folders).",
  "- Edit only your track’s directories (see ownership map in `docs/AGENTS.md`).",
  "- No AI attribution: commits, PRs, docs, and comments must not credit any AI or tool; no tool trailers; normal human commit messages (see docs/AGENTS.md).",
  "",
  "Development sample (fixture track owns body in `lib/adapt/fixture.ts`): campus-pilot notice with deadline, two groups, two times, written-approval exception. Seeded failure: “All members arrive at 8:30 AM.”",
].join("\n");

process.stdout.write(
  JSON.stringify({
    additional_context,
    env: {
      LINAW_AGENT_GUIDE: "docs/AGENTS.md",
      LINAW_SPEC_MANAGER: "spec/AGENTS.md",
      LINAW_AI_WORKFLOW: "docs/ai-workflow.md",
    },
  }),
);
