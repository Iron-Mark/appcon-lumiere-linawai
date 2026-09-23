import { z } from "zod";

/** Preference dimension: how much of the source to present. */
export const DetailSchema = z.enum(["full", "key_points"]);
export type Detail = z.infer<typeof DetailSchema>;

/**
 * Preference dimension: keep source wording, simplify, or render in Taglish —
 * the everyday English–Tagalog mix. Critical values (dates, times, names,
 * conditions) stay verbatim in every wording so Meaning Check can compare them.
 */
export const WordingSchema = z.enum(["original", "plain", "taglish"]);
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
 * `updatedAt` is optional for last-write-wins sync (web ↔ extension).
 */
export const PreferencesSchema = z.object({
  detail: DetailSchema,
  wording: WordingSchema,
  delivery: DeliverySchema,
  browserBehavior: BrowserBehaviorSchema,
  updatedAt: z.number().optional(),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

/** Defaults for local development exercises (Auto-Adapt remains off). */
export const DEFAULT_PREFERENCES: Preferences = {
  detail: "key_points",
  wording: "plain",
  delivery: "read",
  browserBehavior: "manual",
};
