/**
 * Only selector for the adapt implementation.
 * Prefers the `/api/adapt` client; falls back to the in-browser fixture.
 * Callers must import adapt() from this module, never fixture or http directly.
 */
export {
  adapt,
  getAdapterInfo,
  getDevelopmentSampleSource,
  AdaptRequestError,
  type AdapterInfo,
} from "./http";
/** Source that exercises the seeded warning path; the UI offers it as "Try a flagged example". */
export { SEEDED_FAILURE_SOURCE as FLAGGED_SAMPLE_SOURCE } from "./fixture";
export type { AdaptFn } from "./port";
