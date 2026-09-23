import { describe, expect, it, vi } from "vitest";
import { fetchLinawJson } from "./linaw-origin";

describe("fetchLinawJson", () => {
  it("uses the first origin that returns JSON", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("refused"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ adapter: "model", providers: ["gemini"] }),
      });

    const result = await fetchLinawJson("/api/adapt", { method: "GET" }, fetchImpl);

    expect(result).toEqual({
      status: 200,
      json: { adapter: "model", providers: ["gemini"] },
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/api/adapt",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("skips an HTML error page and returns null when every origin fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => {
        throw new SyntaxError("not json");
      },
    });

    const result = await fetchLinawJson(
      "/api/adapt",
      { method: "POST", body: "{}" },
      fetchImpl,
    );

    expect(result).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
