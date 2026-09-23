/**
 * Baseline fidelity-evaluation runner for POST /api/adapt.
 *
 * Usage (from web/):
 *   npm run eval:fidelity
 *   LINAW_API_URL="http://localhost:3000/api/adapt" npm run eval:fidelity
 *
 * Assumes the Next.js dev server (or a deployed instance) is already
 * running at LINAW_API_URL. Does NOT read, print, or modify API keys —
 * credentials live server-side in .env.local and are never touched here.
 *
 * This is plain Node + native TypeScript execution (no ts-node/tsx/test
 * framework dependency). See web/evals/README.md for scope and caveats.
 */

import { fixtures, type FidelityFixture, type IssueType, type NLIStatus } from "./fixtures.mts";

const API_URL = process.env.LINAW_API_URL?.trim() || "http://localhost:3000/api/adapt";

interface AdaptResponseIssue {
  type: IssueType;
  severity: "critical" | "minor";
  description?: string;
  originalSnippet?: string;
  adaptedSnippet?: string | null;
}

interface AdaptResponseBody {
  meaningMap?: unknown[];
  adaptedText?: string;
  repaired?: boolean;
  verification?: {
    status?: "ok" | "warning";
    issues?: AdaptResponseIssue[];
    summary?: string;
  };
  verifiedAgainstFinalText?: boolean;
  nli?: { enabled?: boolean; status?: NLIStatus; flaggedClaims?: number; auditedClaims?: number };
  error?: string;
}

type Verdict = "PASS" | "FAIL" | "REVIEW";

interface CaseResult {
  id: string;
  verdict: Verdict;
  httpStatus: number | null;
  latencyMs: number;
  reasons: string[];
  confirmations: string[];
  isCleanControl: boolean;
  body: AdaptResponseBody | null;
}

function hasStrongExpectation(expected: FidelityFixture["expected"]): boolean {
  return (
    expected.expectRepair !== undefined ||
    expected.expectedStatus !== undefined ||
    (expected.expectedIssueTypes?.length ?? 0) > 0 ||
    (expected.forbiddenIssueTypes?.length ?? 0) > 0 ||
    expected.expectNLIEnabled !== undefined ||
    expected.expectNLIStatus !== undefined ||
    (expected.requiredSubstringsInAdaptedText?.length ?? 0) > 0 ||
    (expected.forbiddenSubstringsInAdaptedText?.length ?? 0) > 0
  );
}

async function runCase(fixture: FidelityFixture): Promise<CaseResult> {
  const reasons: string[] = [];
  const confirmations: string[] = [];
  const isCleanControl = fixture.tags?.includes("clean-control") ?? false;
  const expectSuccess = fixture.expected.requestShouldSucceed ?? true;

  const start = performance.now();
  let httpStatus: number | null = null;
  let body: AdaptResponseBody | null = null;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalText: fixture.originalText,
        preferences: fixture.preferences,
      }),
    });
    httpStatus = res.status;
    body = (await res.json().catch(() => null)) as AdaptResponseBody | null;

    const succeeded = res.ok;
    if (succeeded !== expectSuccess) {
      reasons.push(`expected requestShouldSucceed=${expectSuccess} but got HTTP ${res.status}`);
    } else {
      confirmations.push(`HTTP ${res.status} matched expectation`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    reasons.push(`network/fetch error: ${message} (is the dev server running at ${API_URL}?)`);
    return {
      id: fixture.id,
      verdict: "FAIL",
      httpStatus: null,
      latencyMs: performance.now() - start,
      reasons,
      confirmations,
      isCleanControl,
      body: null,
    };
  }

  const latencyMs = performance.now() - start;

  if (httpStatus !== null && httpStatus >= 200 && httpStatus < 300 && body) {
    const issueTypes = new Set((body.verification?.issues ?? []).map((i) => i.type));
    const adaptedTextLower = (body.adaptedText ?? "").toLowerCase();

    if (fixture.expected.expectRepair !== undefined) {
      if (Boolean(body.repaired) !== fixture.expected.expectRepair) {
        reasons.push(`expected repaired=${fixture.expected.expectRepair} but got ${body.repaired}`);
      } else {
        confirmations.push(`repaired=${body.repaired} matched expectation`);
      }
    }

    if (fixture.expected.expectedStatus !== undefined) {
      if (body.verification?.status !== fixture.expected.expectedStatus) {
        reasons.push(
          `expected verification.status="${fixture.expected.expectedStatus}" but got "${body.verification?.status}"`
        );
      } else {
        confirmations.push(`verification.status="${body.verification?.status}" matched expectation`);
      }
    }

    for (const t of fixture.expected.expectedIssueTypes ?? []) {
      if (!issueTypes.has(t)) {
        reasons.push(`expected issue type "${t}" to be present, but it was not detected`);
      } else {
        confirmations.push(`issue type "${t}" detected as expected`);
      }
    }

    for (const t of fixture.expected.forbiddenIssueTypes ?? []) {
      if (issueTypes.has(t)) {
        reasons.push(`forbidden issue type "${t}" was detected (possible false warning)`);
      } else {
        confirmations.push(`issue type "${t}" correctly absent`);
      }
    }

    if (fixture.expected.expectNLIEnabled !== undefined) {
      if (Boolean(body.nli?.enabled) !== fixture.expected.expectNLIEnabled) {
        reasons.push(
          `expected nli.enabled=${fixture.expected.expectNLIEnabled} but got ${body.nli?.enabled} (is NLI_ENDPOINT configured on the server?)`
        );
      } else {
        confirmations.push(`nli.enabled=${body.nli?.enabled} matched expectation`);
      }
    }

    if (fixture.expected.expectNLIStatus !== undefined) {
      const actualStatus = body.nli?.status;
      if (actualStatus !== fixture.expected.expectNLIStatus) {
        if (fixture.expected.expectNLIStatus === "ok" && actualStatus === "soft_failure") {
          reasons.push(
            `expected nli.status="ok" but got "soft_failure" — NLI_ENDPOINT was configured (nli.enabled) but the inference request did not complete successfully (timeout, non-2xx response, or malformed payload); check server logs for the [NLI] warning`
          );
        } else if (fixture.expected.expectNLIStatus !== "disabled" && actualStatus === "disabled") {
          reasons.push(
            `expected nli.status="${fixture.expected.expectNLIStatus}" but NLI is disabled — NLI_ENDPOINT is not configured on the server`
          );
        } else {
          reasons.push(`expected nli.status="${fixture.expected.expectNLIStatus}" but got "${actualStatus}"`);
        }
      } else {
        confirmations.push(`nli.status="${actualStatus}" matched expectation`);
      }
    }

    for (const s of fixture.expected.requiredSubstringsInAdaptedText ?? []) {
      if (!adaptedTextLower.includes(s.toLowerCase())) {
        reasons.push(`expected adaptedText to contain "${s}", but it did not`);
      } else {
        confirmations.push(`adaptedText contains required substring "${s}"`);
      }
    }

    for (const s of fixture.expected.forbiddenSubstringsInAdaptedText ?? []) {
      if (adaptedTextLower.includes(s.toLowerCase())) {
        reasons.push(`forbidden substring "${s}" was found in adaptedText`);
      } else {
        confirmations.push(`adaptedText correctly does not contain "${s}"`);
      }
    }
  }

  const strong = hasStrongExpectation(fixture.expected);
  let verdict: Verdict;
  if (reasons.length > 0) {
    verdict = "FAIL";
  } else if (!strong) {
    verdict = "REVIEW";
  } else {
    verdict = "PASS";
  }

  return { id: fixture.id, verdict, httpStatus, latencyMs, reasons, confirmations, isCleanControl, body };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function printCaseResult(fixture: FidelityFixture, result: CaseResult): void {
  const label = result.verdict === "PASS" ? "PASS  " : result.verdict === "FAIL" ? "FAIL  " : "REVIEW";
  console.log(`[${label}] ${fixture.id} (${result.latencyMs.toFixed(0)}ms, HTTP ${result.httpStatus ?? "n/a"})`);
  console.log(`        ${fixture.description}`);

  if (result.body?.verification) {
    const issueTypes = (result.body.verification.issues ?? []).map((i) => i.type);
    console.log(
      `        verification.status=${result.body.verification.status ?? "n/a"} | issues=[${issueTypes.join(", ")}] | repaired=${result.body.repaired} | verifiedAgainstFinalText=${result.body.verifiedAgainstFinalText}`
    );
    console.log(
      `        nli.enabled=${result.body.nli?.enabled ?? "n/a"} | nli.status=${result.body.nli?.status ?? "n/a"} | nli.flaggedClaims=${result.body.nli?.flaggedClaims ?? "n/a"} | nli.auditedClaims=${result.body.nli?.auditedClaims ?? "n/a"}`
    );
    console.log(`        summary: ${result.body.verification.summary ?? "no issue found in these checks"}`);
  } else if (result.body?.error) {
    console.log(`        server error: ${result.body.error}`);
  }

  for (const c of result.confirmations) console.log(`        + ${c}`);
  for (const r of result.reasons) console.log(`        ! ${r}`);
  if (fixture.notes) console.log(`        note: ${fixture.notes}`);
  console.log("");
}

function printSummary(results: CaseResult[]): void {
  const total = results.length;
  const passed = results.filter((r) => r.verdict === "PASS").length;
  const failed = results.filter((r) => r.verdict === "FAIL").length;
  const review = results.filter((r) => r.verdict === "REVIEW").length;

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const mean = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
  const p50 = percentile(latencies, 50);

  const cleanControls = results.filter((r) => r.isCleanControl);
  const falseWarnings = cleanControls.filter((r) => r.body?.verification && r.body.verification.status !== "ok").length;

  console.log("---------------------------------------------");
  console.log(`Total cases:                             ${total}`);
  console.log(`Passed defined checks:                   ${passed}`);
  console.log(`Failed:                                  ${failed}`);
  console.log(`Requires manual review (no strong checks): ${review}`);
  console.log(`Latency mean / p50:                      ${mean.toFixed(0)}ms / ${p50.toFixed(0)}ms`);
  console.log(`False-warning count on clean controls:   ${falseWarnings} / ${cleanControls.length}`);
  console.log("---------------------------------------------");
  console.log(
    "Note: this reports whether defined checks passed, not overall correctness. Language intentionally mirrors Linaw's product voice — 'passed defined checks', 'issue detected', 'requires review', 'no issue found in these checks'. Nothing here is presented as 100% accurate or guaranteed correct."
  );
}

async function main(): Promise<void> {
  console.log("Linaw AI — baseline fidelity evaluation");
  console.log(`Target endpoint: ${API_URL}`);
  console.log(`Cases: ${fixtures.length}`);
  console.log(
    "This is a baseline engineering regression set, not a scientific benchmark and not Hugging Face fine-tuning data. Generative outputs are nondeterministic.\n"
  );

  const results: CaseResult[] = [];
  for (const fixture of fixtures) {
    // Sequential execution, intentionally — keeps concurrent load on the
    // dev server (and on paid Gemini/HF quota) minimal, as requested.
    const result = await runCase(fixture);
    results.push(result);
    printCaseResult(fixture, result);
  }

  printSummary(results);

  // Exit non-zero only for true failed assertions — REVIEW cases (fixtures
  // with no strong expectation defined) never fail the build on their own.
  const anyFailed = results.some((r) => r.verdict === "FAIL");
  process.exitCode = anyFailed ? 1 : 0;
}

main().catch((err) => {
  console.error("Fatal error running fidelity evaluation:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
