import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AdaptResponseSchema,
  DEFAULT_PREFERENCES,
  type AdaptResponse,
} from "@/lib/domain";
import { SEEDED_FAILURE_SOURCE } from "@/lib/adapt/fixture";
import { clearModelCache, modelCacheKey, writeModelCache } from "./cache";
import { adaptWithModel, modelConfigured } from "./model";
import { POST } from "./route";

vi.mock("./model", () => ({
  modelConfigured: vi.fn(() => false),
  readModelProviders: vi.fn(() => []),
  adaptWithModel: vi.fn(),
}));

const modelBody: AdaptResponse = {
  adaptedText: "Clarified note.",
  meaningMap: { sourceIntent: "A note.", criticalFacts: [] },
  checks: [
    {
      claim: "The note is unchanged.",
      status: "pass",
      evidence: "Bring the form.",
      reason: "Matches the source.",
    },
  ],
  overallStatus: "pass",
  adapter: "model",
};

function postAdapt(source: string, preferences = DEFAULT_PREFERENCES) {
  return POST(
    new Request("http://localhost/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, preferences }),
    }),
  );
}

describe("POST /api/adapt", () => {
  beforeEach(() => {
    clearModelCache();
    vi.mocked(modelConfigured).mockReturnValue(false);
    vi.mocked(adaptWithModel).mockReset();
  });

  it("returns a schema-valid response for a valid body", async () => {
    const request = new Request("http://localhost/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "",
        preferences: DEFAULT_PREFERENCES,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json: unknown = await response.json();
    const parsed = AdaptResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.adaptedText.length).toBeGreaterThan(0);
      expect(parsed.data.checks.length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid JSON with a plain-language 400", async () => {
    const request = new Request("http://localhost/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = (await response.json()) as { error?: string };
    expect(json.error).toMatch(/valid JSON/i);
  });

  it("rejects a body that fails the request schema", async () => {
    const request = new Request("http://localhost/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "hello" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = (await response.json()) as { error?: string };
    expect(json.error).toMatch(/expected shape/i);
  });

  it("calls the model once for the same source and wording, including a delivery change", async () => {
    vi.mocked(modelConfigured).mockReturnValue(true);
    vi.mocked(adaptWithModel).mockResolvedValue({
      provider: "gemini",
      response: modelBody,
    });

    const first = await postAdapt("Bring the form by Thursday at 5 PM.");
    const second = await postAdapt("Bring the form by Thursday at 5 PM.", {
      ...DEFAULT_PREFERENCES,
      delivery: "listen",
    });

    expect(adaptWithModel).toHaveBeenCalledTimes(1);
    expect(first.headers.get("x-linaw-adapter")).toBe("model:gemini");
    expect(second.headers.get("x-linaw-adapter")).toBe("model:cache");
    const json = (await second.json()) as AdaptResponse;
    expect(json.adapter).toBe("model");
    expect(json.adaptedText).toBe("Clarified note.");
  });

  it("calls the model again when the wording changes", async () => {
    vi.mocked(modelConfigured).mockReturnValue(true);
    vi.mocked(adaptWithModel).mockResolvedValue({
      provider: "openai-compatible",
      response: modelBody,
    });

    await postAdapt("Bring the form by Thursday at 5 PM.");
    await postAdapt("Bring the form by Thursday at 5 PM.", {
      ...DEFAULT_PREFERENCES,
      wording: "original",
    });

    expect(adaptWithModel).toHaveBeenCalledTimes(2);
  });

  it("does not read the cache for the seeded failure example", async () => {
    vi.mocked(modelConfigured).mockReturnValue(true);
    const key = modelCacheKey(
      SEEDED_FAILURE_SOURCE,
      DEFAULT_PREFERENCES.detail,
      DEFAULT_PREFERENCES.wording,
    );
    writeModelCache(key, modelBody);

    const response = await postAdapt(SEEDED_FAILURE_SOURCE);
    const json = (await response.json()) as AdaptResponse;

    expect(adaptWithModel).not.toHaveBeenCalled();
    expect(response.headers.get("x-linaw-adapter")).toBe("fixture");
    expect(json.adapter).toBe("fixture");
    expect(json.adaptedText).not.toBe(modelBody.adaptedText);
  });
});
