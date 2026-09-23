import { z } from "zod";

/** Critical fact types that generative rewrites often alter. */
export const CriticalFactTypeSchema = z.enum([
  "deadline",
  "schedule",
  "date",
  "time",
  "quantity",
  "condition",
  "exception",
  "permission",
  "prohibition",
  "negation",
  "actor",
  "action",
  "relationship",
  "other",
]);
export type CriticalFactType = z.infer<typeof CriticalFactTypeSchema>;

export const CriticalFactSchema = z.object({
  id: z.string(),
  type: CriticalFactTypeSchema,
  actor: z.string().nullable(),
  action: z.string().nullable(),
  value: z.string().nullable(),
  condition: z.string().nullable(),
  exception: z.string().nullable(),
  negated: z.boolean(),
  evidence: z.string(),
});
export type CriticalFact = z.infer<typeof CriticalFactSchema>;

/** Structured source representation (Meaning Map). */
export const MeaningMapSchema = z.object({
  sourceIntent: z.string(),
  criticalFacts: z.array(CriticalFactSchema),
});
export type MeaningMap = z.infer<typeof MeaningMapSchema>;
