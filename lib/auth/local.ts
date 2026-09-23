import type {
  AuthStore,
  AuthUser,
  SavedItem,
  SaveItemResult,
  SignInInput,
} from "./port";

/** localStorage key for optional device profile + saved titles. */
export const AUTH_STORAGE_KEY = "linaw.auth.v1";

/** Same-tab listeners (storage events only fire across tabs). */
export const AUTH_CHANGE_EVENT = "linaw:auth-change";

type AuthSnapshot = {
  user: AuthUser | null;
  savedItems: SavedItem[];
};

const EMPTY: AuthSnapshot = { user: null, savedItems: [] };

function canUseLocalStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function readSnapshot(): AuthSnapshot {
  if (!canUseLocalStorage()) return EMPTY;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;
    const user =
      parsed.user &&
      typeof parsed.user.name === "string" &&
      typeof parsed.user.email === "string"
        ? { name: parsed.user.name.trim(), email: parsed.user.email.trim() }
        : null;
    const savedItems = Array.isArray(parsed.savedItems)
      ? parsed.savedItems.filter(
          (item): item is SavedItem =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.savedAt === "string",
        )
      : [];
    return { user, savedItems };
  } catch {
    return EMPTY;
  }
}

function writeSnapshot(next: AuthSnapshot): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  notifyChange();
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * In-browser auth adapter. No network. A later Supabase module can implement
 * the same AuthStore shape and be selected from index.ts.
 */
export const localAuthStore: AuthStore = {
  async getUser() {
    return readSnapshot().user;
  },

  async signIn(input: SignInInput) {
    const name = input.name.trim();
    const email = input.email.trim();
    if (!name || !email) {
      throw new Error("Name and email are required to save on this device.");
    }
    const user: AuthUser = { name, email };
    const current = readSnapshot();
    writeSnapshot({ ...current, user });
    return user;
  },

  async signOut() {
    const current = readSnapshot();
    writeSnapshot({ ...current, user: null });
  },

  async listSavedItems() {
    return readSnapshot().savedItems;
  },

  async saveItem(title: string): Promise<SaveItemResult> {
    const trimmed = title.trim();
    const current = readSnapshot();
    if (!current.user) {
      return { ok: false, reason: "signed_out" };
    }
    if (!trimmed) {
      throw new Error("A title is required to save.");
    }
    const existing = current.savedItems.find(
      (item) => item.title.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      return { ok: true, item: existing };
    }
    const item: SavedItem = {
      id: newId(),
      title: trimmed,
      savedAt: new Date().toISOString(),
    };
    writeSnapshot({
      ...current,
      savedItems: [item, ...current.savedItems],
    });
    return { ok: true, item };
  },

  async removeSavedItem(id: string) {
    const current = readSnapshot();
    writeSnapshot({
      ...current,
      savedItems: current.savedItems.filter((item) => item.id !== id),
    });
  },
};
