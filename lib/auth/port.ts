/**
 * Optional auth port — local today, replaceable with a later Supabase adapter.
 * Sign-in is never required to use Linaw.
 */

/** localStorage key for the optional on-device profile. */
export const AUTH_STORAGE_KEY = "linaw.auth.v1";

export type AuthUser = {
  name: string;
  email: string;
};

export type SavedItem = {
  id: string;
  title: string;
  /** ISO timestamp when the title was saved on this device */
  savedAt: string;
};

export type SignInInput = {
  name: string;
  email: string;
  /** Required only when cloud auth is configured. Ignored by the local store. */
  password?: string;
  /** Cloud only. Local sign-in always creates or updates the on-device profile. */
  mode?: "sign-in" | "sign-up";
};

/**
 * Result of attempting to save a title.
 * `saved` is false when there is no signed-in user — callers should explain
 * that sign-in lives on Settings, without inventing a cloud.
 */
export type SaveItemResult =
  | { ok: true; item: SavedItem }
  | { ok: false; reason: "signed_out" };

export interface AuthStore {
  getUser(): Promise<AuthUser | null>;
  signIn(input: SignInInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  listSavedItems(): Promise<SavedItem[]>;
  /** Persist a title only when signed in. Never stores page body text. */
  saveItem(title: string): Promise<SaveItemResult>;
  removeSavedItem(id: string): Promise<void>;
}
