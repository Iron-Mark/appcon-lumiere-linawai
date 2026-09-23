/** Minimal Chrome extension typings used by the Linaw companion. */

interface ChromeStorageArea {
  get(
    keys?: string | string[] | Record<string, unknown> | null,
  ): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

interface ChromeRuntimeMessage {
  type: string;
  [key: string]: unknown;
}

interface ChromeTab {
  id?: number;
  url?: string;
}

declare namespace chrome {
  const storage: {
    local: ChromeStorageArea;
    onChanged: {
      addListener(
        callback: (
          changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
          areaName: string,
        ) => void,
      ): void;
    };
  };

  const runtime: {
    onMessage: {
      addListener(
        callback: (
          message: ChromeRuntimeMessage,
          sender: unknown,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
    };
    sendMessage(message: ChromeRuntimeMessage): Promise<unknown>;
    lastError?: { message?: string };
  };

  const tabs: {
    query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
    }): Promise<ChromeTab[]>;
    sendMessage(tabId: number, message: ChromeRuntimeMessage): Promise<unknown>;
  };

  const action: {
    onClicked: {
      addListener(callback: (tab: ChromeTab) => void): void;
    };
  };

  const sidePanel: {
    open(options: { windowId?: number; tabId?: number }): Promise<void>;
    setPanelBehavior(behavior: { openPanelOnActionClick?: boolean }): Promise<void>;
    setOptions(options: { tabId?: number; path?: string; enabled?: boolean }): Promise<void>;
  };
}

