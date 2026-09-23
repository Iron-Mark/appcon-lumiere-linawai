import { DEFAULT_PREFERENCES, type Preferences } from "@/lib/domain";

/** Shared prefs for Key Points coverage during fidelity evals. */
export const EVAL_PREFERENCES: Preferences = {
  ...DEFAULT_PREFERENCES,
  detail: "key_points",
  wording: "plain",
  delivery: "read",
  browserBehavior: "manual",
};
