import type { Preferences } from "@/lib/domain";
import { PreferencesSchema } from "@/lib/domain";
import type { SavedItem } from "./port";

/** Row written to public.linaw_profiles. No source or page text fields. */
export type LinawProfileWrite = {
  user_id: string;
  display_name: string;
  preferences: Preferences;
  saved_items: SavedItem[];
  updated_at: string;
};

export function profileWrite(input: {
  userId: string;
  displayName: string;
  preferences: Preferences;
  savedItems: SavedItem[];
  updatedAt?: string;
}): LinawProfileWrite {
  return {
    user_id: input.userId,
    display_name: input.displayName,
    preferences: PreferencesSchema.parse(input.preferences),
    saved_items: input.savedItems.map((item) => ({
      id: item.id,
      title: item.title,
      savedAt: item.savedAt,
    })),
    updated_at: input.updatedAt ?? new Date().toISOString(),
  };
}

export function parseSavedItems(raw: unknown): SavedItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is SavedItem =>
      !!item &&
      typeof item === "object" &&
      typeof (item as SavedItem).id === "string" &&
      typeof (item as SavedItem).title === "string" &&
      typeof (item as SavedItem).savedAt === "string",
  );
}
