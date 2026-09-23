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

/** Section 17 adapt response. */
export const AdaptResponseSchema = z.object({
  adaptedText: z.string(),
  meaningMap: MeaningMapSchema,
  checks: z.array(CheckSchema),
  overallStatus: CheckStatusSchema,
});
export type AdaptResponse = z.infer<typeof AdaptResponseSchema>;
