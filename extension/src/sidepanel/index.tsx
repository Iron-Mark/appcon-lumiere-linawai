import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Panel } from "../content/Panel";
import { PANEL_CSS } from "../content/index";
import {
  DEFAULT_PREFERENCES,
  disableOrigin,
  enableOrigin,
  getPreferences,
  toggleOriginDisabled,
  type ExtensionPreferences,
} from "../storage/preferences";

function SidePanelApp() {
  const [origin, setOrigin] = useState<string>("");
  const [preferences, setPreferences] =
    useState<ExtensionPreferences>(DEFAULT_PREFERENCES);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const loadGen = useRef(0);

  async function queryActiveTabOrigin(): Promise<string> {
    try {
      if (typeof chrome === "undefined" || !chrome.tabs?.query) return "";
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.url) {
        try {
          const parsed = new URL(tab.url).origin;
          return parsed.startsWith("http") ? parsed : "";
        } catch {
          return "";
        }
      }
      return "";
    } catch {
      return "";
    }
  }

  async function loadState() {
    const gen = loadGen.current + 1;
    loadGen.current = gen;
    const currentOrigin = await queryActiveTabOrigin();
    if (gen !== loadGen.current) return;
    setOrigin(currentOrigin);

    try {
      const prefs = await getPreferences();
      if (gen !== loadGen.current) return;
      setPreferences(prefs);
    } catch {
      // Keep defaults when storage is blocked.
    }

    try {
      const storage = await chrome.storage.local.get("pendingSourceText");
      if (gen !== loadGen.current) return;
      const pending = storage.pendingSourceText;
      if (typeof pending === "string" && pending.trim()) {
        setSource(pending.trim());
      } else {
        setSource("");
      }
    } catch {
      if (gen === loadGen.current) setSource("");
    }
    if (gen === loadGen.current) setLoading(false);
  }

  useEffect(() => {
    loadGen.current += 1;
    void loadState().catch(() => setLoading(false));

    const onActivated = () => {
      void loadState().catch(() => undefined);
    };
    const onUpdated = (
      _tabId: number,
      changeInfo: { status?: string; url?: string },
    ) => {
      if (changeInfo.status === "complete" || changeInfo.url) {
        void loadState().catch(() => undefined);
      }
    };
    const onStorage = (
      changes: Record<string, { newValue?: unknown }>,
      area: string,
    ) => {
      if (area === "local") {
        if (changes["linaw.preferences.v1"]) {
          void getPreferences()
            .then(setPreferences)
            .catch(() => undefined);
        }
        if (changes.pendingSourceText) {
          const nextText = changes.pendingSourceText.newValue;
          if (typeof nextText === "string") {
            setSource(nextText.trim());
          } else if (nextText == null) {
            setSource("");
          }
        }
      }
    };

    try {
      chrome.tabs?.onActivated?.addListener(onActivated);
    } catch {
      // Tabs events unavailable.
    }
    try {
      chrome.tabs?.onUpdated?.addListener(onUpdated);
    } catch {
      // Tabs events unavailable.
    }
    try {
      chrome.storage?.onChanged?.addListener(onStorage);
    } catch {
      // Storage events unavailable.
    }
    return () => {
      try {
        (chrome.tabs?.onActivated as unknown as { removeListener?: (cb: () => void) => void })?.removeListener?.(onActivated);
      } catch {
        // Ignore cleanup failure.
      }
      try {
        (chrome.tabs?.onUpdated as unknown as { removeListener?: (cb: (...args: never[]) => void) => void })?.removeListener?.(onUpdated as (...args: never[]) => void);
      } catch {
        // Ignore cleanup failure.
      }
      try {
        (chrome.storage?.onChanged as unknown as { removeListener?: (cb: (...args: never[]) => void) => void })?.removeListener?.(onStorage as (...args: never[]) => void);
      } catch {
        // Ignore cleanup failure.
      }
    };
  }, []);

  async function handleToggleSite() {
    if (!origin) return;
    await toggleOriginDisabled(origin);
    const updated = await getPreferences();
    setPreferences(updated);
  }

  async function handleDisableSite() {
    if (!origin) return;
    await disableOrigin(origin);
    const updated = await getPreferences();
    setPreferences(updated);
  }

  const isCurrentOriginDisabled =
    Boolean(origin) && preferences.disabledOrigins.includes(origin);

  if (loading) {
    return (
      <div className="linaw-panel" style={{ padding: "16px" }}>
        <style>{PANEL_CSS}</style>
        <p className="linaw-loading">Loading Linaw companion…</p>
      </div>
    );
  }

  return (
    <div className="linaw-sidepanel-container">
      <style>{PANEL_CSS}</style>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #faf6f0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .linaw-sidepanel-container {
          max-width: 480px;
          margin: 0 auto;
          padding: 16px 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .linaw-sidepanel-container .linaw-panel {
          border: none;
          box-shadow: none;
          padding: 0;
        }
        .linaw-home-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 2px 0;
        }
        .linaw-home-mark {
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: radial-gradient(circle at 35% 35%, #6b7a3f, #4f5d2f);
          box-shadow: 0 1px 3px rgb(26 24 20 / 0.25);
          flex-shrink: 0;
        }
        .linaw-home-titles {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .linaw-home-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #1a1814;
        }
        .linaw-home-sub {
          margin: 0;
          font-size: 0.72rem;
          font-weight: 500;
          color: #5c564c;
        }
        .linaw-home-footer {
          display: flex;
          justify-content: center;
          padding-top: 4px;
          border-top: 1px solid #e8dfd2;
        }
        .linaw-home-link {
          font-size: 0.78rem;
          font-weight: 600;
          color: #4f5d2f;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .linaw-home-link:hover {
          background-color: #e4ebd4;
          text-decoration: underline;
        }
      `}</style>

      <header className="linaw-home-header">
        <span className="linaw-home-mark" aria-hidden="true" />
        <div className="linaw-home-titles">
          <p className="linaw-home-name">Linaw</p>
          <p className="linaw-home-sub">Reading companion</p>
        </div>
      </header>

      {/* Restricted pages (chrome://, PDFs, webstore) expose no tab URL. */}
      {!origin && !isCurrentOriginDisabled && (
        <div
          className="linaw-disabled-banner"
          role="note"
          style={{ marginBottom: "14px" }}
        >
          <p className="linaw-disabled-banner-text">
            Linaw can&apos;t see this page (browser or PDF pages hide their address). Select text on an ordinary web page, then reopen the panel.
          </p>
        </div>
      )}

      {/* Recovery State Banner for Side Panel when site is disabled */}
      {isCurrentOriginDisabled && (
        <div
          className="linaw-disabled-banner"
          role="alert"
          style={{ marginBottom: "14px" }}
        >
          <p className="linaw-disabled-banner-text">
            Linaw is currently disabled on this site ({origin}).
          </p>
          <button
            type="button"
            id="linaw-sidepanel-enable-btn"
            name="linaw-sidepanel-enable-btn"
            className="linaw-enable-primary-btn"
            onClick={() => void handleToggleSite()}
          >
            Enable Linaw on this site
          </button>
        </div>
      )}

      <Panel
        source={source}
        preferences={preferences}
        origin={origin}
        onPreferencesChange={(next) => {
          setPreferences((prev) => ({
            ...prev,
            ...next,
            disabledOrigins:
              (next as Partial<ExtensionPreferences>).disabledOrigins ??
              prev.disabledOrigins,
          }));
        }}
        onDisableSite={() => void handleDisableSite()}
      />

      <footer className="linaw-home-footer">
        <a
          className="linaw-home-link"
          href="https://appcon-lumiere-linawai.vercel.app/read"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Linaw web app ↗
        </a>
      </footer>
    </div>
  );
}

const mount = document.getElementById("root");
if (mount) {
  const root = createRoot(mount);
  root.render(<SidePanelApp />);
}

