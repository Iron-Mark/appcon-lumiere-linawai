import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AdaptResponseSchema,
  DEFAULT_PREFERENCES,
} from "@/lib/domain";
import { AdaptRequestError, adapt } from "./http";

const validRequest = {
  source: "hello",
  preferences: DEFAULT_PREFERENCES,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("adapt http client", () => {
  it("returns a schema-valid body from a successful /api/adapt response", async () => {
    const fixtureLike = {
      adaptedText: "Clarified hello.",
      meaningMap: {
        sourceIntent: "A short greeting.",
        criticalFacts: [],
      },
      checks: [
        {
          claim: "hello",
          status: "pass" as const,
          evidence: "hello",
          reason: "Matches the source.",
        },
      ],
      overallStatus: "pass" as const,
    };
    expect(AdaptResponseSchema.safeParse(fixtureLike).success).toBe(true);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => fixtureLike,
      }),
    );

    const result = await adapt(validRequest);
    expect(result.adaptedText).toBe("Clarified hello.");
    expect(result.overallStatus).toBe("pass");
  });

  it("surfaces the route plain-language error when /api/adapt fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: "The request did not match the expected shape.",
        }),
      }),
    );

    await expect(adapt(validRequest)).rejects.toBeInstanceOf(AdaptRequestError);
    await expect(adapt(validRequest)).rejects.toThrow(
      /did not match the expected shape/i,
    );
  });

  it("falls back to the fixture when the server is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    const result = await adapt({
      source: "",
      preferences: DEFAULT_PREFERENCES,
    });
    const parsed = AdaptResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.adaptedText.length).toBeGreaterThan(0);
    }
  });

  it("falls back to the fixture when the error body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    );

    const result = await adapt({
      source: "",
      preferences: DEFAULT_PREFERENCES,
    });
    expect(AdaptResponseSchema.safeParse(result).success).toBe(true);
  });
});
