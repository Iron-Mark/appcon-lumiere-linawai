import { z } from "zod";

/** Fidelity / Meaning Check status (canon §17). */
export const CheckStatusSchema = z.enum([
  "pass",
  "warning",
  "repair_required",
]);
export type CheckStatus = z.infer<typeof CheckStatusSchema>;

export const CheckSchema = z.object({
  claim: z.string(),
  status: CheckStatusSchema,
  evidence: z.string(),
  reason: z.string(),
});
export type Check = z.infer<typeof CheckSchema>;
