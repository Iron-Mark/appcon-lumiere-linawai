import { useEffect, useState } from "react";
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

  async function queryActiveTabOrigin(): Promise<string> {
    try {
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
    const currentOrigin = await queryActiveTabOrigin();
    setOrigin(currentOrigin);

    const prefs = await getPreferences();
    setPreferences(prefs);

    const storage = await chrome.storage.local.get("pendingSourceText");
    const pending = storage.pendingSourceText;
    if (typeof pending === "string" && pending.trim()) {
      setSource(pending.trim());
    } else {
      setSource("");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadState();

    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener(() => {
        void loadState();
      });
    }

    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
        if (changeInfo.status === "complete" || changeInfo.url) {
          void loadState();
        }
      });
    }

    if (chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local") {
          if (changes["linaw.preferences.v1"]) {
            void getPreferences().then(setPreferences);
          }
          if (changes.pendingSourceText) {
            const nextText = changes.pendingSourceText.newValue;
            if (typeof nextText === "string") {
              setSource(nextText.trim());
            }
          }
        }
      });
    }
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
          padding: 12px;
          background-color: #ffffff;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .linaw-sidepanel-container .linaw-panel {
          border: none;
          box-shadow: none;
          padding: 0;
        }
      `}</style>

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
    </div>
  );
}

const mount = document.getElementById("root");
if (mount) {
  const root = createRoot(mount);
  root.render(<SidePanelApp />);
}

