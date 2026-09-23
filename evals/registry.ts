import { campusPilotEvalCase } from "./campus-pilot";
import { growthEvalCases } from "./growth-cases";
import { campusOrgEvalCases } from "./campus-org-cases";
import { policyEvalCases } from "./policy-cases";
import { publicAdvisoryEvalCases } from "./public-advisory-cases";
import type { EvalCase } from "./schema";
import { schoolEvalCases } from "./school-cases";
import { workplaceEvalCases } from "./workplace-cases";

/**
 * All committed fidelity eval sources (§14 shape).
 * Growth path: add cases in the category modules; keep campus-pilot.
 */
export const allEvalCases: EvalCase[] = [
  campusPilotEvalCase,
  ...schoolEvalCases,
  ...campusOrgEvalCases,
  ...workplaceEvalCases,
  ...publicAdvisoryEvalCases,
  ...policyEvalCases,
  ...growthEvalCases,
];

export const EVAL_SOURCE_COUNT = allEvalCases.length;
