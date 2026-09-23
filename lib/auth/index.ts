/**
 * Only selector for the auth implementation.
 * Today: localStorage. Later: switch to a Supabase adapter without changing callers.
 */
import { localAuthStore } from "./local";

export { localAuthStore as authStore, AUTH_STORAGE_KEY, AUTH_CHANGE_EVENT } from "./local";
export type {
  AuthStore,
  AuthUser,
  SavedItem,
  SaveItemResult,
  SignInInput,
} from "./port";

/**
 * Tiny helper My Content (or later routes) can call to persist a title.
 * Does not send page text anywhere. Returns whether the save happened.
 */
export function saveContentTitle(title: string) {
  return localAuthStore.saveItem(title);
}
