import { z } from "zod";
import {
  CheckStatusSchema,
  MeaningMapSchema,
} from "@/lib/domain";

/**
 * Eval case shape aligned with canon §14:
 * gold source + gold Meaning Map + seeded corruptions.
 */
export const EvalCorruptionSchema = z.object({
  id: z.string(),
  /** Corruption type from §14 (e.g. actor/value swap, wrong time). */
  type: z.string(),
  adaptedText: z.string(),
  expectedOverallStatus: CheckStatusSchema,
  /** Substring expected in at least one check reason. */
  expectedReasonIncludes: z.string().optional(),
});
export type EvalCorruption = z.infer<typeof EvalCorruptionSchema>;

export const EvalCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  goldMeaningMap: MeaningMapSchema,
  corruptions: z.array(EvalCorruptionSchema).min(1),
});
export type EvalCase = z.infer<typeof EvalCaseSchema>;
