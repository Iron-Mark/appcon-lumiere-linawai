import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allEvalCases } from "./registry";

const ADAPT_URL =
  process.env.PILOT_URL ??
  "https://appcon-lumiere-linawai.vercel.app/api/adapt";

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

describe.skipIf(process.env.PILOT_LIVE !== "1")("20 live pilot clarifications", () => {
  it(
    "records whether gold facts survive",
    async () => {
      const cases = allEvalCases.slice(0, 20);
      const rows: {
        id: string;
        profile: string;
        http: number;
        adapter: string | null;
        status: string;
        ms: number;
        missing: number;
        needles: number;
        missingFacts: string[];
        evidenceOff: number;
      }[] = [];

      for (let i = 0; i < cases.length; i++) {
        const item = cases[i];
        const preferences = PROFILES[i % PROFILES.length];
        const started = Date.now();
        const res = await fetch(ADAPT_URL, {
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
          meaningMap?: { criticalFacts?: { evidence?: string; value?: string | null; condition?: string | null; exception?: string | null }[] };
        };
        const text = json.adaptedText ?? "";
        const needles = (item.goldMeaningMap.criticalFacts ?? [])
          .flatMap((f) => [f.value, f.condition, f.exception])
          .filter((v): v is string => Boolean(v && v.trim().length >= 4))
          .filter((v) => norm(item.source).includes(norm(v)));
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
          ms: Date.now() - started,
          missing: missing.length,
          needles: needles.length,
          missingFacts: missing.slice(0, 6),
          evidenceOff,
        });
        console.log(
          `${i + 1}/20 ${item.id} ${adapter ?? res.status} ${json.overallStatus ?? json.error} missing=${missing.length}/${needles.length}`,
        );
      }

      const dropped = rows.reduce((n, r) => n + r.missing, 0);
      const total = rows.reduce((n, r) => n + r.needles, 0);
      const summary = {
        model: rows.filter((r) => (r.adapter ?? "").startsWith("model")).length,
        fixture: rows.filter((r) => r.adapter === "fixture").length,
        dropped,
        total,
        rows,
      };
      writeFileSync(
        new URL("./pilot-20-results.json", import.meta.url),
        JSON.stringify(summary, null, 2),
      );
      expect(rows).toHaveLength(20);
    },
    20 * 90_000,
  );
});
