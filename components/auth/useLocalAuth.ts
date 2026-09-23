"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AUTH_CHANGE_EVENT,
  AUTH_STORAGE_KEY,
  authStore,
  type AuthStore,
  type AuthUser,
  type SavedItem,
  type SignInInput,
} from "@/lib/auth";

export type LocalAuthState = {
  ready: boolean;
  user: AuthUser | null;
  savedItems: SavedItem[];
  refresh: () => Promise<void>;
  signIn: (input: SignInInput) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  saveItem: AuthStore["saveItem"];
  removeSavedItem: (id: string) => Promise<void>;
};

/**
 * Client hook over the auth port. Optional — Landing, Read, and Meaning Check
 * never need this.
 */
export function useLocalAuth(): LocalAuthState {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const refresh = useCallback(async () => {
    const [nextUser, nextItems] = await Promise.all([
      authStore.getUser(),
      authStore.listSavedItems(),
    ]);
    setUser(nextUser);
    setSavedItems(nextItems);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === AUTH_STORAGE_KEY || event.key === null) {
        void refresh();
      }
    }

    function onLocalChange() {
      void refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, onLocalChange);
    };
  }, [refresh]);

  const signIn = useCallback(
    async (input: SignInInput) => {
      const next = await authStore.signIn(input);
      await refresh();
      return next;
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await authStore.signOut();
    await refresh();
  }, [refresh]);

  const saveItem = useCallback(
    async (title: string) => {
      const result = await authStore.saveItem(title);
      await refresh();
      return result;
    },
    [refresh],
  );

  const removeSavedItem = useCallback(
    async (id: string) => {
      await authStore.removeSavedItem(id);
      await refresh();
    },
    [refresh],
  );

  return {
    ready,
    user,
    savedItems,
    refresh,
    signIn,
    signOut,
    saveItem,
    removeSavedItem,
  };
}
