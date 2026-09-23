import { z } from "zod";

/** Preference dimension: how much of the source to present. */
export const DetailSchema = z.enum(["full", "key_points"]);
export type Detail = z.infer<typeof DetailSchema>;

/** Preference dimension: keep source wording or simplify. */
export const WordingSchema = z.enum(["original", "plain"]);
export type Wording = z.infer<typeof WordingSchema>;

/** Preference dimension: display or speak the adaptation. */
export const DeliverySchema = z.enum(["read", "listen"]);
export type Delivery = z.infer<typeof DeliverySchema>;

/** Preference dimension: extension auto vs manual. Opt-in for auto_adapt. */
export const BrowserBehaviorSchema = z.enum(["auto_adapt", "manual"]);
export type BrowserBehavior = z.infer<typeof BrowserBehaviorSchema>;

/**
 * User communication preferences.
 * Field names stay stable when a backend arrives.
 */
export const PreferencesSchema = z.object({
  detail: DetailSchema,
  wording: WordingSchema,
  delivery: DeliverySchema,
  browserBehavior: BrowserBehaviorSchema,
});
export type Preferences = z.infer<typeof PreferencesSchema>;

/** Defaults for local development exercises (Auto-Adapt remains off). */
export const DEFAULT_PREFERENCES: Preferences = {
  detail: "key_points",
  wording: "plain",
  delivery: "read",
  browserBehavior: "manual",
};
