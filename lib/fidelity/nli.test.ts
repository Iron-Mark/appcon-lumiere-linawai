import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REASON_NLI_CONTRADICTION,
  REASON_NLI_DISCONNECTED,
  REASON_NLI_ENTAILED,
} from "./copy";
import { runNliSlot } from "./nli";

const ENDPOINT = "http://127.0.0.1:8000/predict";

const baseInput = {
  source: "Mentors should arrive Friday at 8:30 AM.",
  adaptedText: "All members arrive at 8:30 AM.",
  evidence: "Mentors should arrive Friday at 8:30 AM.",
  claim: "All members arrive at 8:30 AM.",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.NLI_ENDPOINT;
  delete process.env.NEXT_PUBLIC_NLI_ENDPOINT;
});

describe("runNliSlot endpoint wiring", () => {
  it("stays disconnected when no endpoint is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await runNliSlot(baseInput);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.label).toBe("neutral");
    expect(result.reason).toBe(REASON_NLI_DISCONNECTED);
    expect(result.check.status).toBe("pass");
  });

  it("posts the nli-service contract when endpoint is passed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        [
          { label: "contradiction", score: 0.91 },
          { label: "entailment", score: 0.04 },
          { label: "neutral", score: 0.05 },
        ],
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runNliSlot({ ...baseInput, endpoint: ENDPOINT });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      inputs: [
        {
          text: baseInput.evidence,
          text_pair: baseInput.claim,
        },
      ],
    });
    expect(result.label).toBe("contradiction");
    expect(result.check.status).toBe("warning");
    expect(result.reason).toBe(REASON_NLI_CONTRADICTION);
  });

  it("reads NLI_ENDPOINT from env when no explicit endpoint is passed", async () => {
    process.env.NLI_ENDPOINT = ENDPOINT;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        [
          { label: "entailment", score: 0.88 },
          { label: "contradiction", score: 0.05 },
          { label: "neutral", score: 0.07 },
        ],
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runNliSlot(baseInput);

    expect(fetchMock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.label).toBe("entailment");
    expect(result.check.status).toBe("pass");
    expect(result.reason).toBe(REASON_NLI_ENTAILED);
  });

  it("reads NEXT_PUBLIC_NLI_ENDPOINT when NLI_ENDPOINT is unset", async () => {
    process.env.NEXT_PUBLIC_NLI_ENDPOINT = ENDPOINT;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        [
          { label: "entailment", score: 0.88 },
          { label: "contradiction", score: 0.05 },
          { label: "neutral", score: 0.07 },
        ],
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runNliSlot(baseInput);

    expect(fetchMock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.label).toBe("entailment");
    expect(result.reason).toBe(REASON_NLI_ENTAILED);
  });

  it("falls back to the disconnected stub when the request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await runNliSlot({ ...baseInput, endpoint: ENDPOINT });

    expect(fetchMock).toHaveBeenCalled();
    expect(result.label).toBe("neutral");
    expect(result.reason).toBe(REASON_NLI_DISCONNECTED);
    expect(result.check.status).toBe("pass");
  });

  it("falls back when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: "nli_inference_failed" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runNliSlot({ ...baseInput, endpoint: ENDPOINT });

    expect(result.reason).toBe(REASON_NLI_DISCONNECTED);
    expect(result.check.claim.toLowerCase()).toContain("neutral");
  });
});
