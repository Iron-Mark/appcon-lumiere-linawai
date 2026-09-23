import {
  CheckStatusSchema,
  type Check,
  type CheckStatus,
  type MeaningMap,
  type Preferences,
} from "@/lib/domain";
import { runCoverageChecks } from "./coverage";
import { runDeterministicChecks } from "./deterministic";
import { runNliSlot } from "./nli";
import { runRelationshipChecks } from "./relationship";

export type FidelityGuardInput = {
  source: string;
  adaptedText: string;
  meaningMap: MeaningMap;
  preferences: Preferences;
  /** Forwarded to the NLI slot when a local/service endpoint is available. */
  nliEndpoint?: string;
};

export type FidelityGuardResult = {
  checks: Check[];
  overallStatus: CheckStatus;
};

/**
 * Single pipeline entry the reading UI / adapt path can call.
 * Layers stay separate; results are concatenated, not collapsed to a boolean.
 * NLI is optional: unset/failing endpoint keeps the disconnected stub.
 */
export async function runFidelityGuard(
  input: FidelityGuardInput,
): Promise<FidelityGuardResult> {
  const { source, adaptedText, meaningMap, preferences, nliEndpoint } = input;

  const deterministic = runDeterministicChecks(meaningMap, adaptedText);
  const relationship = runRelationshipChecks(meaningMap, adaptedText);
  const nli = await runNliSlot({ source, adaptedText, endpoint: nliEndpoint });
  const flaggedIds = collectFlaggedFactIds(meaningMap, [
    ...deterministic,
    ...relationship,
  ]);
  const coverage = runCoverageChecks(
    meaningMap,
    adaptedText,
    preferences,
    flaggedIds,
  );

  const checks: Check[] = [
    ...deterministic,
    ...relationship,
    nli.check,
    ...coverage,
  ];

  return {
    checks,
    overallStatus: aggregateStatus(checks),
  };
}

function aggregateStatus(checks: Check[]): CheckStatus {
  let worst: CheckStatus = "pass";
  for (const check of checks) {
    const status = CheckStatusSchema.parse(check.status);
    if (status === "repair_required") return "repair_required";
    if (status === "warning") worst = "warning";
  }
  return worst;
}

function collectFlaggedFactIds(
  meaningMap: MeaningMap,
  checks: Check[],
): Set<string> {
  const ids = new Set<string>();
  const warningReasons = checks.filter((c) => c.status !== "pass");
  if (warningReasons.length === 0) return ids;

  for (const fact of meaningMap.criticalFacts) {
    const haystacks = [fact.evidence, fact.value, fact.actor, fact.condition]
      .filter(Boolean)
      .map((s) => s!.toLowerCase());
    for (const check of warningReasons) {
      const blob = `${check.claim} ${check.evidence}`.toLowerCase();
      if (
        haystacks.some((h) => h && (blob.includes(h) || check.evidence === fact.evidence))
      ) {
        ids.add(fact.id);
      }
    }
  }
  return ids;
}
