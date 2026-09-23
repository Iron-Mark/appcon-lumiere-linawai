/**
 * Only selector for the auth implementation.
 * Cloud when the public Supabase env is set. Otherwise the on-device profile.
 */
import { isCloudAuthEnabled } from "@/lib/supabase/env";
import { localAuthStore } from "./local";
import { supabaseAuthStore } from "./supabase";

export const authStore = isCloudAuthEnabled()
  ? supabaseAuthStore
  : localAuthStore;

export { AUTH_STORAGE_KEY, AUTH_CHANGE_EVENT } from "./local";
export { isCloudAuthEnabled } from "@/lib/supabase/env";
export type {
  AuthStore,
  AuthUser,
  SavedItem,
  SaveItemResult,
  SignInInput,
} from "./port";

/**
 * Persist a title on the active account. Does not send page text.
 */
export function saveContentTitle(title: string) {
  return authStore.saveItem(title);
}
