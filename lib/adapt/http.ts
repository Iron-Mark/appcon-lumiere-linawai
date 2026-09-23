import {
  AdaptResponseSchema,
  type AdaptRequest,
  type AdaptResponse,
} from "@/lib/domain";
import { adapt as adaptFixture } from "./fixture";

export { getDevelopmentSampleSource } from "./fixture";

/**
 * Client adapt implementation: POST to `/api/adapt`, then fall back to the
 * in-browser fixture if the request fails or the body is not schema-valid.
 * Callers import adapt() from `@/lib/adapt` only.
 */
export async function adapt(input: AdaptRequest): Promise<AdaptResponse> {
  try {
    const res = await fetch("/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      return adaptFixture(input);
    }

    const json: unknown = await res.json();
    const parsed = AdaptResponseSchema.safeParse(json);
    if (!parsed.success) {
      return adaptFixture(input);
    }

    return parsed.data;
  } catch {
    return adaptFixture(input);
  }
}
