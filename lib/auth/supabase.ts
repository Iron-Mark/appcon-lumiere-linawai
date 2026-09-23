import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Preferences } from "@/lib/domain";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import {
  shouldApplyRemotePreferences,
  toDomainPreferences,
} from "@/lib/storage/preferences-sync";
import { parseSavedItems, profileWrite } from "./profile";
import type {
  AuthStore,
  AuthUser,
  SavedItem,
  SaveItemResult,
  SignInInput,
} from "./port";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  preferences: unknown;
  saved_items: unknown;
};

function requireClient(): SupabaseClient {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    throw new Error("Cloud sign-in is not configured.");
  }
  return supabase;
}

async function currentUser(supabase: SupabaseClient): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

async function readProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("linaw_profiles")
    .select("user_id, display_name, preferences, saved_items")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
}

function displayNameFor(user: User, profile: ProfileRow | null, fallback: string): string {
  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) return fromProfile;
  const fromInput = fallback.trim();
  if (fromInput) return fromInput;
  return user.email ?? "";
}

async function writeProfile(
  supabase: SupabaseClient,
  user: User,
  preferences: Preferences,
  savedItems: SavedItem[],
  displayName: string,
): Promise<void> {
  const row = profileWrite({
    userId: user.id,
    displayName,
    preferences,
    savedItems,
  });
  const { error } = await supabase.from("linaw_profiles").upsert(row);
  if (error) throw new Error(error.message);
}

/**
 * After sign-in, keep the newer preference copy.
 * Local wins when the account row is empty or older. Remote wins when newer.
 */
export async function reconcileAccountPreferences(
  user: User,
  displayName: string,
): Promise<void> {
  const supabase = requireClient();
  const { preferenceStore } = await import("@/lib/storage/preferences");
  const local = await preferenceStore.get();
  const profile = await readProfile(supabase, user.id);
  const remote = toDomainPreferences(profile?.preferences);
  const name = displayNameFor(user, profile, displayName);
  const items = parseSavedItems(profile?.saved_items);

  if (remote && (!local || shouldApplyRemotePreferences(local, remote))) {
    await preferenceStore.set(remote);
    if (!profile?.display_name?.trim() && name) {
      await writeProfile(supabase, user, remote, items, name);
    }
    return;
  }

  if (local) {
    await writeProfile(supabase, user, local, items, name);
  }
}

/** Push a preference change when a cloud session exists. No-op otherwise. */
export async function pushPreferencesIfSignedIn(
  preferences: Preferences,
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  const user = await currentUser(supabase);
  if (!user) return;
  const profile = await readProfile(supabase, user.id);
  const remote = toDomainPreferences(profile?.preferences);
  if (remote && !shouldApplyRemotePreferences(remote, preferences)) return;
  await writeProfile(
    supabase,
    user,
    preferences,
    parseSavedItems(profile?.saved_items),
    displayNameFor(user, profile, ""),
  );
}

function toAuthUser(user: User, profile: ProfileRow | null): AuthUser {
  return {
    name: displayNameFor(user, profile, ""),
    email: user.email ?? "",
  };
}

export const supabaseAuthStore: AuthStore = {
  async getUser() {
    const supabase = getBrowserSupabase();
    if (!supabase) return null;
    const user = await currentUser(supabase);
    if (!user) return null;
    const profile = await readProfile(supabase, user.id);
    return toAuthUser(user, profile);
  },

  async signIn(input: SignInInput) {
    const supabase = requireClient();
    const email = input.email.trim();
    const password = input.password?.trim() ?? "";
    const name = input.name.trim();
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (input.mode === "sign-up") {
      if (!name) throw new Error("Name is required to create an account.");
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      if (!data.session || !data.user) {
        throw new Error(
          "Account created. Confirm the email if asked, then sign in.",
        );
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Could not sign in.");
    }

    const user = await currentUser(supabase);
    if (!user) throw new Error("Could not read the signed-in account.");
    await reconcileAccountPreferences(user, name);
    const profile = await readProfile(supabase, user.id);
    return toAuthUser(user, profile);
  },

  async signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async listSavedItems() {
    const supabase = getBrowserSupabase();
    if (!supabase) return [];
    const user = await currentUser(supabase);
    if (!user) return [];
    const profile = await readProfile(supabase, user.id);
    return parseSavedItems(profile?.saved_items);
  },

  async saveItem(title: string): Promise<SaveItemResult> {
    const supabase = requireClient();
    const user = await currentUser(supabase);
    if (!user) return { ok: false, reason: "signed_out" };
    const trimmed = title.trim();
    if (!trimmed) throw new Error("A title is required to save.");
    const profile = await readProfile(supabase, user.id);
    const items = parseSavedItems(profile?.saved_items);
    const existing = items.find(
      (item) => item.title.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return { ok: true, item: existing };
    const item: SavedItem = {
      id: crypto.randomUUID(),
      title: trimmed,
      savedAt: new Date().toISOString(),
    };
    const preferences = toDomainPreferences(profile?.preferences);
    const { preferenceStore } = await import("@/lib/storage/preferences");
    const local = preferences ?? (await preferenceStore.get());
    if (!local) {
      throw new Error("Set reading preferences before saving a title.");
    }
    await writeProfile(
      supabase,
      user,
      local,
      [item, ...items],
      displayNameFor(user, profile, ""),
    );
    return { ok: true, item };
  },

  async removeSavedItem(id: string) {
    const supabase = requireClient();
    const user = await currentUser(supabase);
    if (!user) return;
    const profile = await readProfile(supabase, user.id);
    const preferences = toDomainPreferences(profile?.preferences);
    if (!preferences) return;
    await writeProfile(
      supabase,
      user,
      preferences,
      parseSavedItems(profile?.saved_items).filter((item) => item.id !== id),
      displayNameFor(user, profile, ""),
    );
  },
};
