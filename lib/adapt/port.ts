import type { AdaptRequest, AdaptResponse } from "@/lib/domain";

/**
 * Client adaptation port.
 * Web and extension call this shape; they never import a concrete implementation.
 */
export type AdaptFn = (input: AdaptRequest) => Promise<AdaptResponse>;
