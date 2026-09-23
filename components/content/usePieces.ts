"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PIECES_CHANGE_EVENT,
  PIECES_STORAGE_KEY,
  listPieces,
  removePiece,
  type SavedPiece,
} from "@/lib/content/pieces";

export function usePieces() {
  const [ready, setReady] = useState(false);
  const [pieces, setPieces] = useState<SavedPiece[]>([]);

  const refresh = useCallback(async () => {
    setPieces(await listPieces());
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();

    function onStorage(event: StorageEvent) {
      if (event.key === PIECES_STORAGE_KEY || event.key === null) {
        void refresh();
      }
    }

    function onLocalChange() {
      void refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(PIECES_CHANGE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PIECES_CHANGE_EVENT, onLocalChange);
    };
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await removePiece(id);
      await refresh();
    },
    [refresh],
  );

  return { ready, pieces, remove };
}
