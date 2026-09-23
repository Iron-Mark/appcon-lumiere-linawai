import { describe, expect, it } from "vitest";
import {
  AdaptResponseSchema,
  DEFAULT_PREFERENCES,
} from "@/lib/domain";
import { POST } from "./route";

describe("POST /api/adapt", () => {
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
});
