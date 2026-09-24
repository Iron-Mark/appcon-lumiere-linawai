/**
 * Twenty live clarifications of the committed eval notices.
 * Writes a summary. Does not print source text.
 */
import { allEvalCases } from "../evals/registry";

const URL = process.env.PILOT_URL ?? "https://appcon-lumiere-linawai.vercel.app/api/adapt";

const PROFILES = [
  { detail: "key_points", wording: "plain", delivery: "read", browserBehavior: "manual" },
  { detail: "full", wording: "plain", delivery: "read", browserBehavior: "manual" },
  { detail: "key_points", wording: "original", delivery: "read", browserBehavior: "manual" },
  { detail: "key_points", wording: "taglish", delivery: "read", browserBehavior: "manual" },
  { detail: "full", wording: "taglish", delivery: "read", browserBehavior: "manual" },
] as const;

function norm(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function factNeedles(source: string, values: string[]): string[] {
  const hay = norm(source);
  return values
    .map((v) => v.trim())
    .filter((v) => v.length >= 4 && hay.includes(norm(v)));
}

async function main() {
  const cases = allEvalCases.slice(0, 20);
  const rows: Record<string, unknown>[] = [];

  for (let i = 0; i < cases.length; i++) {
    const item = cases[i];
    const preferences = PROFILES[i % PROFILES.length];
    const started = Date.now();
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: item.source, preferences }),
      signal: AbortSignal.timeout(90_000),
    });
    const adapter = res.headers.get("x-linaw-adapter");
    const json = (await res.json()) as {
      error?: string;
      adaptedText?: string;
      overallStatus?: string;
      checks?: { status: string; reason: string }[];
      meaningMap?: { criticalFacts?: { evidence?: string; value?: string | null }[] };
    };
    const ms = Date.now() - started;
    const text = json.adaptedText ?? "";
    const needles = factNeedles(
      item.source,
      (item.goldMeaningMap.criticalFacts ?? []).flatMap((f) =>
        [f.value, f.condition, f.exception].filter((x): x is string => Boolean(x)),
      ),
    );
    const missing = needles.filter((n) => !norm(text).includes(norm(n)));
    const evidenceOff = (json.meaningMap?.criticalFacts ?? []).filter((f) => {
      const e = (f.evidence ?? "").trim();
      return e.length >= 8 && !norm(item.source).includes(norm(e));
    }).length;

    rows.push({
      id: item.id,
      profile: `${preferences.detail}/${preferences.wording}`,
      http: res.status,
      adapter,
      status: json.overallStatus ?? json.error ?? "none",
      ms,
      chars: text.length,
      needles: needles.length,
      missing: missing.length,
      evidenceOff,
      warnings: (json.checks ?? []).filter((c) => c.status !== "pass").length,
    });
    console.log(
      `${i + 1}/${cases.length} ${item.id} ${adapter ?? res.status} ${json.overallStatus ?? json.error} missing=${missing.length}/${needles.length} ${ms}ms`,
    );
  }

  const model = rows.filter((r) => String(r.adapter ?? "").startsWith("model")).length;
  const fixture = rows.filter((r) => r.adapter === "fixture").length;
  const dropped = rows.reduce((n, r) => n + Number(r.missing), 0);
  const needles = rows.reduce((n, r) => n + Number(r.needles), 0);
  console.log(
    JSON.stringify(
      {
        url: URL,
        runs: rows.length,
        model,
        fixture,
        droppedFacts: dropped,
        factNeedles: needles,
        rows,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
