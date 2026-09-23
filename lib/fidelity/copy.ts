/** Cautious user-facing reasons (canon §12 / meaning-check copy). */

export const REASON_NO_ISSUE = "No issue found in these checks.";

export const REASON_CONDITION_CHANGED =
  "Important condition may have changed. Review source.";

export const REASON_WRONG_GROUP =
  "The time appears to be attached to the wrong group.";

export const REASON_NLI_DISCONNECTED = "Semantic check not connected.";

export const REASON_NLI_CONTRADICTION =
  "Adapted text may conflict with the source. Review source.";

export const REASON_NLI_ENTAILED = "No issue found in these checks.";

export const REASON_NLI_INCONCLUSIVE =
  "Semantic check was inconclusive. Review source if unsure.";

export const REASON_DEADLINE_REVIEW =
  "A deadline or schedule detail may be missing. Review source.";

export const REASON_NEGATION_REVIEW =
  "A restriction or negation may have changed. Review source.";

export const REASON_VALUE_MISMATCH =
  "A date, time, or number may not match the source. Review source.";

export const REASON_OBLIGATION_CHANGED =
  "An obligation or permission may have changed. Review source.";

export const REASON_ENTITY_MISMATCH =
  "A name or group in the adaptation may not match the source. Review source.";
