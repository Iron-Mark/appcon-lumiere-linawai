import { z } from "zod";
import { CheckSchema, CheckStatusSchema } from "./checks";
import { MeaningMapSchema } from "./meaning-map";
import { PreferencesSchema } from "./preferences";

/**
 * Section 17 adapt request.
 * Presentation prefs are required; browserBehavior may be present when stored with preferences.
 */
export const AdaptRequestSchema = z.object({
  source: z.string(),
  preferences: PreferencesSchema,
});
export type AdaptRequest = z.infer<typeof AdaptRequestSchema>;

/** Which implementation produced the adaptation — the UI states this to the reader. */
export const AdapterKindSchema = z.enum(["fixture", "model"]);
export type AdapterKind = z.infer<typeof AdapterKindSchema>;

/** Section 17 adapt response. */
export const AdaptResponseSchema = z.object({
  adaptedText: z.string(),
  meaningMap: MeaningMapSchema,
  checks: z.array(CheckSchema),
  overallStatus: CheckStatusSchema,
  /** Optional provenance; absent means unknown (treated as fixture by the UI). */
  adapter: AdapterKindSchema.optional(),
});
export type AdaptResponse = z.infer<typeof AdaptResponseSchema>;
