import { describe, expect, it } from "vitest";

import { DEFAULT_PREFERENCES } from "@/lib/domain";
import { profileWrite } from "./profile";

describe("profileWrite", () => {
  it("stores preferences and titles only", () => {
    const row = profileWrite({
      userId: "user-1",
      displayName: "Ava",
      preferences: { ...DEFAULT_PREFERENCES, updatedAt: 10 },
      savedItems: [
        { id: "item-1", title: "Campus notice", savedAt: "2026-09-24T00:00:00.000Z" },
      ],
      updatedAt: "2026-09-24T00:00:00.000Z",
    });

    expect(row.user_id).toBe("user-1");
    expect(row.preferences.detail).toBe("key_points");
    expect(row.saved_items).toEqual([
      {
        id: "item-1",
        title: "Campus notice",
        savedAt: "2026-09-24T00:00:00.000Z",
      },
    ]);
    expect(JSON.stringify(row)).not.toMatch(/source|adaptedText|page/i);
  });
});