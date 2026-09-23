"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { adapt, getDevelopmentSampleSource } from "@/lib/adapt";
import { SignInDialog } from "@/components/auth";
import { authStore } from "@/lib/auth";
import {
  getPiece,
  savePiece,
  statusFromOverall,
  type PieceStatus,
} from "@/lib/content/pieces";
import {
  DEFAULT_PREFERENCES,
  type AdaptResponse,
  type Detail,
  type Delivery,
  type Preferences,
  type Wording,
} from "@/lib/domain";
import { preferenceStore } from "@/lib/storage/preferences";
import { Sindi, type SindiState } from "@/components/sindi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Check, Clipboard, Paperclip, Trash2 } from "lucide-react";
import { ModeBar } from "./ModeBar";
import { MeaningCheckRail } from "./MeaningCheckRail";
import { NoteCard } from "./NoteCard";
import { buildMarks, warningLineForChecks } from "./marks";
import { statusLabel } from "./AdaptedText";
import { useListen } from "./useListen";
import {
  enforceSourceLength,
  readSourceFile,
  sanitizeSourceText,
  SOURCE_UPLOAD_ACCEPT,
  SOURCE_UPLOAD_LIMITS_ID,
  SOURCE_UPLOAD_LIMITS_TEXT,
} from "./readSourceFile";

type ReadingWorkspaceProps = {
  /** Piece id from /read?piece= — loads that saved source. */
  pieceId?: string | null;
};

export function ReadingWorkspace({ pieceId = null }: ReadingWorkspaceProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [prefsReady, setPrefsReady] = useState(false);
  const [hasStoredPrefs, setHasStoredPrefs] = useState(false);

  const [draftSource, setDraftSource] = useState("");
  const [composerExpanded, setComposerExpanded] = useState(true);
  const [sourceWellFocused, setSourceWellFocused] = useState(false);
  const [sourceDropActive, setSourceDropActive] = useState(false);
  const [sourceSettled, setSourceSettled] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [clipboardCopied, setClipboardCopied] = useState(false);
  /** True after Adapt has been clicked; grid stays once a result exists. */
  const [resultsRevealed, setResultsRevealed] = useState(false);
  /** Source last sent to adapt(); empty string means fixture sample. */
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [usingFixtureSample, setUsingFixtureSample] = useState(false);

  const [result, setResult] = useState<AdaptResponse | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePieceId, setActivePieceId] = useState<string | null>(null);
  const [savedMark, setSavedMark] = useState<{
    id: string;
    source: string;
    status: PieceStatus;
  } | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const adaptGeneration = useRef(0);
  const resultRef = useRef<AdaptResponse | null>(null);
  const preferencesRef = useRef(preferences);
  const runAdaptRef = useRef<
    | ((
        source: string,
        prefs: Preferences,
        options?: { fixtureSample?: boolean; autoListen?: boolean },
      ) => Promise<void>)
    | null
  >(null);
  const saveAfterSignInRef = useRef(false);
  const loadedPieceRef = useRef<string | null>(null);
  const openedFromPieceRef = useRef(false);
  const stopListenRef = useRef<() => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedText = result?.adaptedText ?? "";
  const { listening, start: startListen, stop: stopListen, toggle: toggleListen } =
    useListen(displayedText);
  stopListenRef.current = stopListen;

  const draftHasText = draftSource.trim().length > 0;
  const showEmptyPrompt = composerExpanded && !sourceWellFocused && !draftHasText;
  const showResultsGrid = resultsRevealed && (working || result !== null);
  const collapsedPreview = draftSource
    .replace(/\s+/g, " ")
    .trim();

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await preferenceStore.get();
      if (cancelled) return;
      if (stored) {
        setPreferences(stored);
        setHasStoredPrefs(true);
      }
      setPrefsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  /** Sidebar Checks → /read#meaning-check lands on the rail. */
  useEffect(() => {
    if (!prefsReady) return;
    if (typeof window === "undefined") return;

    const scrollToRail = () => {
      if (window.location.hash !== "#meaning-check") return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const el = document.getElementById("meaning-check");
      if (!el) return;
      requestAnimationFrame(() => {
        el.scrollIntoView({
          block: "start",
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    };

    scrollToRail();
    window.addEventListener("hashchange", scrollToRail);
    return () => window.removeEventListener("hashchange", scrollToRail);
  }, [prefsReady, showResultsGrid]);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const flashSettle = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (prefersReducedMotion()) {
      setSourceSettled(false);
      return;
    }
    setSourceSettled(true);
    settleTimerRef.current = setTimeout(() => {
      setSourceSettled(false);
      settleTimerRef.current = null;
    }, 450);
  }, []);

  const applyDraftText = useCallback(
    (raw: string, options?: { announce?: string; settle?: boolean }) => {
      const checked = enforceSourceLength(sanitizeSourceText(raw));
      if (!checked.ok) {
        setError(checked.error);
        setUploadStatus(checked.error);
        return false;
      }
      setDraftSource(checked.text);
      setError(null);
      if (options?.announce) setUploadStatus(options.announce);
      if (options?.settle !== false) flashSettle();
      return true;
    },
    [flashSettle],
  );

  const runAdapt = useCallback(
    async (
      source: string,
      prefs: Preferences,
      options?: { fixtureSample?: boolean; autoListen?: boolean },
    ) => {
      const generation = ++adaptGeneration.current;
      setWorking(true);
      setError(null);
      setShowingOriginal(false);
      setSelectedIndex(null);
      stopListen();

      try {
        const response = await adapt({ source, preferences: prefs });
        if (generation !== adaptGeneration.current) return;
        setResult(response);
        setActiveSource(source);
        setUsingFixtureSample(Boolean(options?.fixtureSample));
        setWorking(false);
        setResultsRevealed(true);

        const shouldListen =
          options?.autoListen ?? prefs.delivery === "listen";
        if (shouldListen && response.adaptedText.trim()) {
          startListen(response.adaptedText);
        }
      } catch {
        if (generation !== adaptGeneration.current) return;
        setWorking(false);
        setError("Could not adapt this note. Try again.");
        if (!resultRef.current) {
          setResultsRevealed(false);
        }
      }
    },
    [startListen, stopListen],
  );

  preferencesRef.current = preferences;
  runAdaptRef.current = runAdapt;

  useEffect(() => {
    if (!prefsReady) return;

    if (!pieceId) {
      if (!openedFromPieceRef.current) return;
      openedFromPieceRef.current = false;
      loadedPieceRef.current = null;
      setDraftSource("");
      setResult(null);
      setResultsRevealed(false);
      setActiveSource(null);
      setActivePieceId(null);
      setSavedMark(null);
      setComposerExpanded(true);
      setError(null);
      setSaveNotice(null);
      setShowingOriginal(false);
      setSelectedIndex(null);
      stopListenRef.current();
      return;
    }

    if (loadedPieceRef.current === pieceId) return;

    let cancelled = false;
    openedFromPieceRef.current = true;

    void (async () => {
      const piece = await getPiece(pieceId);
      if (cancelled) return;
      if (!piece) {
        setError("That piece is not on this device.");
        setResultsRevealed(false);
        return;
      }
      loadedPieceRef.current = piece.id;
      setDraftSource(piece.source);
      setActivePieceId(piece.id);
      setSavedMark({
        id: piece.id,
        source: piece.source,
        status: piece.status,
      });
      setComposerExpanded(false);
      setError(null);
      setSaveNotice(null);
      void runAdaptRef.current?.(piece.source, preferencesRef.current, {
        fixtureSample: false,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pieceId, prefsReady]);

  const sourceMatchesAdapt =
    activeSource !== null && draftSource.trim() === activeSource.trim();
  const alreadySaved =
    savedMark !== null &&
    result !== null &&
    savedMark.id === activePieceId &&
    savedMark.source === activeSource?.trim() &&
    savedMark.status === statusFromOverall(result.overallStatus) &&
    sourceMatchesAdapt;

  const persistPiece = useCallback(async () => {
    if (!result || activeSource === null || working) return;
    const source = activeSource.trim();
    if (draftSource.trim() !== source) {
      setSaveNotice("Adapt this source before saving.");
      return;
    }
    const user = await authStore.getUser();
    if (!user) {
      saveAfterSignInRef.current = true;
      setSignInOpen(true);
      return;
    }
    try {
      const piece = await savePiece({
        id: activePieceId,
        source,
        status: statusFromOverall(result.overallStatus),
      });
      loadedPieceRef.current = piece.id;
      openedFromPieceRef.current = true;
      setActivePieceId(piece.id);
      setSavedMark({
        id: piece.id,
        source: piece.source,
        status: piece.status,
      });
      setSaveNotice("Saved on this device.");
      setError(null);
      if (pieceId !== piece.id) {
        router.replace(`/read?piece=${encodeURIComponent(piece.id)}`, {
          scroll: false,
        });
      }
    } catch (err) {
      setSaveNotice(
        err instanceof Error
          ? err.message
          : "Could not save this piece. Try again.",
      );
    }
  }, [
    activePieceId,
    activeSource,
    draftSource,
    pieceId,
    result,
    router,
    working,
  ]);

  const persistAndAdapt = useCallback(
    async (next: Preferences) => {
      setPreferences(next);
      try {
        await preferenceStore.set(next);
        setHasStoredPrefs(true);
      } catch {
        // Local write failed — still adapt with in-memory prefs.
      }
      if (activeSource !== null && resultsRevealed) {
        await runAdapt(activeSource, next, {
          fixtureSample: usingFixtureSample,
          autoListen: next.delivery === "listen",
        });
      }
    },
    [activeSource, resultsRevealed, runAdapt, usingFixtureSample],
  );

  const onDetail = (detail: Detail) => {
    void persistAndAdapt({ ...preferences, detail });
  };
  const onWording = (wording: Wording) => {
    void persistAndAdapt({ ...preferences, wording });
  };
  const onDelivery = (delivery: Delivery) => {
    void persistAndAdapt({ ...preferences, delivery });
  };

  const onAdaptDraft = () => {
    const source = draftSource.trim();
    if (!source) return;
    setResultsRevealed(true);
    setComposerExpanded(false);
    void runAdapt(source, preferences, {
      fixtureSample: false,
      autoListen: preferences.delivery === "listen",
    });
  };

  const onLoadSample = () => {
    setDraftSource(getDevelopmentSampleSource());
    setError(null);
    setUploadStatus("Example loaded into the source.");
    setComposerExpanded(false);
  };

  const onClearDraft = () => {
    setDraftSource("");
    setError(null);
    setUploadStatus("Source cleared.");
    setComposerExpanded(true);
    setSourceWellFocused(false);
    setClipboardCopied(false);
  };

  const flashCopied = () => {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setClipboardCopied(true);
    copiedTimerRef.current = setTimeout(() => {
      setClipboardCopied(false);
      copiedTimerRef.current = null;
    }, 1200);
  };

  const onClipboardAction = async () => {
    if (draftHasText) {
      try {
        await navigator.clipboard.writeText(draftSource);
        setError(null);
        setUploadStatus("Copied");
        flashCopied();
      } catch {
        const message = "Could not copy. Select the text and copy it yourself.";
        setError(message);
        setUploadStatus(message);
      }
      return;
    }

    try {
      const clip = await navigator.clipboard.readText();
      const incoming = sanitizeSourceText(clip);
      if (!incoming.trim()) {
        const message = "Clipboard is empty.";
        setError(message);
        setUploadStatus(message);
        return;
      }
      const checked = enforceSourceLength(incoming);
      if (!checked.ok) {
        setError(checked.error);
        setUploadStatus(checked.error);
        return;
      }
      setDraftSource(checked.text);
      setError(null);
      setUploadStatus("Pasted into the source.");
      setComposerExpanded(true);
    } catch {
      const message =
        "Could not read the clipboard. Paste with the keyboard instead.";
      setError(message);
      setUploadStatus(message);
    }
  };

  const onEditSource = () => {
    setComposerExpanded(true);
  };

  const dataTransferHasSource = (dt: DataTransfer) => {
    const types = [...dt.types];
    return types.includes("text/plain") || types.includes("Files");
  };

  const onSourceDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!dataTransferHasSource(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setSourceDropActive(true);
  };

  const onSourceDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setSourceDropActive(false);
  };

  const ingestFile = useCallback(
    async (file: File) => {
      setUploadStatus("Reading file…");
      setError(null);
      const outcome = await readSourceFile(file);
      if (!outcome.ok) {
        setError(outcome.error);
        setUploadStatus(outcome.error);
        return;
      }
      setDraftSource(outcome.text);
      setError(null);
      setUploadStatus("File added to the source.");
      flashSettle();
    },
    [flashSettle],
  );

  const onSourceDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setSourceDropActive(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        const message = "Drop one file at a time.";
        setError(message);
        setUploadStatus(message);
        return;
      }
      void ingestFile(files[0]!);
      return;
    }

    const text = event.dataTransfer.getData("text/plain");
    if (!text) return;
    applyDraftText(text, { announce: "Text added to the source." });
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void ingestFile(file);
  };

  const marks = useMemo(() => {
    if (!result) return [];
    return buildMarks(
      result.adaptedText,
      result.checks,
      result.meaningMap.criticalFacts,
    );
  }, [result]);

  const originalForDisplay = useMemo(() => {
    if (activeSource && activeSource.trim()) return activeSource;
    if (!result) return "";
    // Fixture sample: reconstruct source from Meaning Map evidence (never hardcode it).
    const fromFacts = result.meaningMap.criticalFacts
      .map((f) => f.evidence.trim())
      .filter(Boolean);
    if (fromFacts.length > 0) {
      return [...new Set(fromFacts)].join(" ");
    }
    const fromChecks = result.checks
      .map((c) => c.evidence.trim())
      .filter(Boolean);
    return [...new Set(fromChecks)].join(" ");
  }, [activeSource, result]);

  const sindiState: SindiState = (() => {
    if (working) return "working";
    if (listening) return "listening";
    if (!result) return "empty";
    if (
      result.overallStatus === "warning" ||
      result.overallStatus === "repair_required"
    ) {
      return "warning";
    }
    if (result.overallStatus === "pass") return "pass";
    return "reading";
  })();

  const sindiLine =
    sindiState === "warning" && result
      ? warningLineForChecks(result.checks)
      : undefined;

  const detailLabel =
    preferences.detail === "full" ? "Full" : "Key Points";
  const wordingLabel =
    preferences.wording === "original" ? "Original" : "Plain Language";
  const deliveryLabel =
    preferences.delivery === "listen" ? "Listen" : "Read";

  const statusLine = statusLabel(
    result?.overallStatus ?? null,
    working,
    listening,
    detailLabel,
    wordingLabel,
  );

  const onSelectCheck = (index: number | null) => {
    setSelectedIndex(index);
    if (index == null) return;
    const reduceMotion = prefersReducedMotion();
    const scrollOpts: ScrollIntoViewOptions = {
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    };
    const markEl = document.getElementById(`adapted-mark-${index}`);
    const cardEl = document.getElementById(`meaning-check-card-${index}`);
    markEl?.scrollIntoView(scrollOpts);
    cardEl?.scrollIntoView(scrollOpts);
    markEl?.focus({ preventScroll: true });
  };

  if (!prefsReady) {
    return (
      <main
        style={{
          padding: "2rem 1.25rem",
          fontFamily: "var(--font-ui)",
          color: "var(--color-ink-muted)",
        }}
      >
        Loading preferences…
      </main>
    );
  }

  const wellBorder = sourceDropActive
    ? "2px dashed var(--color-action-border)"
    : sourceSettled
      ? "2px solid var(--color-action)"
      : "2px dashed color-mix(in srgb, var(--color-ink-muted) 45%, var(--color-paper-inset))";

  const wellBackground = sourceDropActive
    ? "color-mix(in srgb, var(--color-action-soft) 70%, var(--color-paper-inset))"
    : sourceSettled
      ? "color-mix(in srgb, var(--color-action-soft) 35%, var(--color-paper-inset))"
      : "var(--color-paper-inset)";

  const sourceIconClassName =
    "source-well-icon size-11 min-h-11 min-w-11 shrink-0 cursor-pointer text-ink-muted hover:bg-transparent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring/60";

  const clearSourceButton = draftHasText ? (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClearDraft}
      disabled={working}
      aria-label="Clear source"
      className={sourceIconClassName}
    >
      <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
    </Button>
  ) : null;

  const sourceBottomIcons = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onUploadClick}
        disabled={working}
        aria-label="Upload a text or PDF file"
        aria-describedby={SOURCE_UPLOAD_LIMITS_ID}
        className={sourceIconClassName}
      >
        <Paperclip aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void onClipboardAction()}
        disabled={working}
        aria-label={draftHasText ? "Copy source" : "Paste from clipboard"}
        className={sourceIconClassName}
      >
        {clipboardCopied ? (
          <Check
            aria-hidden="true"
            className="size-5 text-[var(--color-action)]"
            strokeWidth={1.75}
          />
        ) : (
          <Clipboard aria-hidden="true" className="size-5" strokeWidth={1.75} />
        )}
      </Button>
    </>
  );

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
        padding: "1.5rem 1.25rem 3rem",
        maxWidth: "74rem",
        margin: "0 auto",
        width: "100%",
        minWidth: 0,
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="read-page-header"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.85rem 1.5rem",
          minWidth: 0,
          paddingTop: "0.35rem",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 16rem" }}>
          <h1
            className="font-reading"
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 1.5rem + 1.6vw, 2.6rem)",
              fontWeight: 600,
              letterSpacing: "-0.022em",
              lineHeight: 1.1,
              color: "var(--color-ink)",
            }}
          >
            Read
          </h1>
          <p
            style={{
              margin: "0.45rem 0 0",
              fontSize: "1.0625rem",
              lineHeight: 1.5,
              color: "var(--color-ink-muted)",
            }}
          >
            Adapt a message, then check the meaning.
          </p>
        </div>
        <div style={{ marginLeft: "auto", minWidth: 0 }}>
          <ModeBar
            detail={preferences.detail}
            wording={preferences.wording}
            delivery={preferences.delivery}
            disabled={working}
            onDetail={onDetail}
            onWording={onWording}
            onDelivery={onDelivery}
          />
        </div>
      </div>

      {!hasStoredPrefs ? (
        <p
          style={{
            margin: "-0.75rem 0 0",
            padding: "0 0 0 0.75rem",
            borderLeft: "2px solid var(--color-paper-inset)",
            fontSize: "0.875rem",
            color: "var(--color-ink-muted)",
            lineHeight: 1.45,
          }}
        >
          Preferences are not saved yet.{" "}
          <Link
            href="/onboarding"
            className="cursor-pointer underline-offset-2 hover:underline"
            style={{ color: "var(--color-action)", fontWeight: 500 }}
          >
            Set your defaults
          </Link>
          , or keep going with the current ones.
        </p>
      ) : null}

      <section
        aria-label="Source"
        className={`source-composer${composerExpanded ? " source-composer--expanded" : " source-composer--collapsed"}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: composerExpanded ? "0.85rem" : "0.55rem",
          padding: composerExpanded
            ? "1.35rem 1.35rem 1.15rem"
            : "0.85rem 1rem",
          background: "var(--color-paper-raised)",
          border: "1px solid var(--color-paper-inset)",
          borderRadius: "1rem",
          boxShadow:
            "0 1px 0 color-mix(in srgb, var(--color-ink) 4%, transparent)",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {composerExpanded ? (
          <>
            <div
              className={`source-well${sourceDropActive ? " source-well--drop" : ""}${sourceSettled ? " source-well--settled" : ""}`}
              onDragOver={onSourceDragOver}
              onDragLeave={onSourceDragLeave}
              onDrop={onSourceDrop}
              style={{
                position: "relative",
                minHeight: "9.5rem",
                maxHeight: "16rem",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                background: wellBackground,
                border: wellBorder,
                borderRadius: "0.75rem",
                outline: sourceDropActive
                  ? "2px solid var(--color-action)"
                  : undefined,
                outlineOffset: sourceDropActive ? "2px" : undefined,
              }}
            >
              {showEmptyPrompt ? (
                <div
                  aria-hidden="true"
                  className="source-well-prompt font-ui"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    padding: "1.25rem",
                    pointerEvents: "none",
                    textAlign: "center",
                  }}
                >
                  <span
                    className="font-reading"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--color-ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Paste or drop a message
                  </span>
                  <span
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    A notice, email, or lesson.
                  </span>
                </div>
              ) : null}
              <Textarea
                id="source-input"
                value={draftSource}
                onChange={(event) => setDraftSource(event.target.value)}
                onFocus={() => setSourceWellFocused(true)}
                onBlur={() => setSourceWellFocused(false)}
                rows={6}
                aria-label="Source text"
                placeholder={
                  showEmptyPrompt
                    ? undefined
                    : "Paste or enter the message to adapt…"
                }
                className={`font-ui source-well-textarea [field-sizing:fixed] block min-h-[9.5rem] max-h-64 w-full max-w-full flex-1 resize-none overflow-y-auto cursor-text border-0 bg-transparent px-3.5 pb-14 pt-3 text-base leading-relaxed text-ink shadow-none placeholder:text-ink-muted focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-ring/60 md:text-base ${
                  draftHasText ? "pr-14" : ""
                }`}
              />
              {draftHasText ? (
                <div
                  className="source-well-clear"
                  style={{
                    position: "absolute",
                    top: "0.25rem",
                    right: "0.35rem",
                    zIndex: 2,
                  }}
                >
                  {clearSourceButton}
                </div>
              ) : null}
              <div
                className="source-well-actions"
                style={{
                  position: "absolute",
                  right: "0.35rem",
                  bottom: "0.25rem",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.1rem",
                }}
              >
                {sourceBottomIcons}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.65rem",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={onLoadSample}
                  disabled={working}
                  className="min-h-11 min-w-11 cursor-pointer font-ui text-[0.9375rem] font-medium focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  Use an example
                </Button>
              </div>
              <Button
                type="button"
                variant="default"
                onClick={onAdaptDraft}
                disabled={working || !draftHasText}
                aria-disabled={working || !draftHasText}
                aria-describedby={
                  !draftHasText ? "adapt-disabled-reason" : undefined
                }
                className="adapt-primary min-h-11 min-w-11 cursor-pointer px-5 font-ui text-[0.9375rem] font-semibold focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Adapt
              </Button>
            </div>
          </>
        ) : (
          <div className="source-composer-collapsed">
            <p
              className="font-ui source-composer-collapsed-preview"
              title={collapsedPreview}
            >
              {collapsedPreview || "No source text"}
            </p>
            <div
              className="source-composer-collapsed-actions"
              aria-label="Source actions"
            >
              <Button
                type="button"
                variant="outline"
                onClick={onEditSource}
                aria-expanded={composerExpanded}
                className="min-h-10 shrink-0 cursor-pointer font-ui text-[0.875rem] font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Edit source
              </Button>
              {/* Once a result exists the note is the focus; re-adapt steps back to secondary. */}
              <Button
                type="button"
                variant={result ? "outline" : "default"}
                onClick={onAdaptDraft}
                disabled={working || !draftHasText}
                aria-disabled={working || !draftHasText}
                aria-describedby={
                  !draftHasText ? "adapt-disabled-reason" : undefined
                }
                className={`${result ? "" : "adapt-primary "}min-h-10 shrink-0 cursor-pointer px-4 font-ui text-[0.875rem] font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring/60`}
              >
                {result ? "Adapt again" : "Adapt"}
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={SOURCE_UPLOAD_ACCEPT}
          className="source-visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={onFileInputChange}
        />

        <p id={SOURCE_UPLOAD_LIMITS_ID} className="source-visually-hidden">
          {SOURCE_UPLOAD_LIMITS_TEXT}
        </p>
        {!draftHasText ? (
          <p id="adapt-disabled-reason" className="source-visually-hidden">
            Adapt is unavailable until you enter, paste, or upload source text.
          </p>
        ) : null}

        <div
          aria-live="polite"
          aria-atomic="true"
          className="source-visually-hidden"
        >
          {uploadStatus}
        </div>

        {error ? (
          <p
            role="alert"
            style={{
              margin: 0,
              color: "var(--color-warning)",
              fontSize: "0.9375rem",
              borderLeft:
                "3px solid var(--color-warning-border, var(--color-warning))",
              paddingLeft: "0.65rem",
            }}
          >
            {error}
          </p>
        ) : null}
      </section>

      {!showResultsGrid ? (
        <section
          aria-label="How Linaw works"
          className="read-guide animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none"
          style={{ animationDelay: "80ms" }}
        >
          <div className="read-guide-mascot" aria-hidden="true">
            <Sindi state="empty" line="" className="read-guide-ray" />
          </div>
          <div className="read-guide-heading">
            <p className="read-guide-eyebrow">How Linaw works</p>
            <p className="read-guide-lede font-reading">
              Paste, adapt, then check the meaning held.
            </p>
          </div>
          <ol className="read-guide-steps">
            {[
              {
                title: "Paste or drop",
                body: "Plain text or a PDF, up to 30 pages long.",
              },
              {
                title: "Adapt",
                body: "Rewritten to your detail and wording choices.",
              },
              {
                title: "Meaning Check",
                body: "Key facts are checked against the source.",
              },
            ].map((step, i) => (
              <li key={step.title} className="read-guide-step">
                <span aria-hidden="true" className="read-guide-num font-reading">
                  {i + 1}
                </span>
                <div>
                  <p className="read-guide-title">{step.title}</p>
                  <p className="read-guide-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {showResultsGrid ? (
        <div
          className="read-workspace-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.55fr) minmax(17rem, 0.85fr)",
            gap: "1.15rem",
            alignItems: "start",
            gridAutoRows: "min-content",
          }}
        >
          <div
            className="read-note-surface animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out fill-mode-both motion-reduce:animate-none"
            style={{
              padding: "1.5rem 1.65rem 1.6rem",
              minWidth: 0,
              alignSelf: "start",
              height: "fit-content",
              background: "var(--color-paper-raised)",
              border: "1px solid var(--color-paper-inset)",
              borderRadius: "1rem",
              boxShadow:
                "0 1px 2px color-mix(in srgb, var(--color-ink) 6%, transparent), 0 16px 40px -20px color-mix(in srgb, var(--color-ink) 22%, transparent)",
            }}
          >
            <NoteCard
              title="Adapted note"
              statusLine={statusLine}
              adaptedText={displayedText}
              originalText={originalForDisplay}
              showingOriginal={showingOriginal}
              onToggleOriginal={() => setShowingOriginal((v) => !v)}
              listening={listening}
              onToggleListen={toggleListen}
              canListen={Boolean(displayedText.trim()) && !working}
              marks={showingOriginal ? [] : marks}
              selectedIndex={selectedIndex}
              onSelectMark={(index) => onSelectCheck(index)}
              overallStatus={result?.overallStatus ?? null}
              working={working}
            />
            {result && !working ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.65rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--color-paper-inset)",
                }}
              >
                <Button
                  type="button"
                  variant={alreadySaved ? "outline" : "default"}
                  onClick={() => void persistPiece()}
                  disabled={alreadySaved || !sourceMatchesAdapt}
                  className={`${
                    alreadySaved
                      ? "border-action-border bg-action-soft/60 text-action disabled:opacity-100 "
                      : "adapt-primary "
                  }font-ui h-10 min-h-10 cursor-pointer gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-default`}
                >
                  {alreadySaved ? (
                    <Check aria-hidden className="size-4" strokeWidth={2.25} />
                  ) : (
                    <Bookmark aria-hidden className="size-4" strokeWidth={2} />
                  )}
                  {alreadySaved ? "Saved on this device" : "Save on this device"}
                </Button>
                {saveNotice && !alreadySaved ? (
                  <p
                    className="font-ui"
                    aria-live="polite"
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {saveNotice}
                  </p>
                ) : !sourceMatchesAdapt ? (
                  <p
                    className="font-ui"
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    Adapt this source before saving.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            className="read-meaning-rail animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out fill-mode-both motion-reduce:animate-none"
            style={{
              padding: "1.15rem 1.1rem 1.25rem",
              minWidth: 0,
              alignSelf: "start",
              height: "fit-content",
              background:
                "color-mix(in srgb, var(--color-paper-raised) 60%, transparent)",
              border: "1px solid var(--color-paper-inset)",
              borderRadius: "1rem",
              animationDelay: "110ms",
            }}
          >
            <MeaningCheckRail
              checks={result?.checks ?? null}
              overallStatus={result?.overallStatus ?? null}
              selectedIndex={selectedIndex}
              onSelect={onSelectCheck}
              sindiState={sindiState}
              sindiLine={sindiLine}
              loading={working}
            />
          </div>
        </div>
      ) : null}

      <style>{`
        @media (max-width: 860px) {
          .read-workspace-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 375px) {
          .source-composer {
            padding: 1.1rem 1rem 1rem !important;
          }
        }
        .source-composer {
          transition: padding 180ms ease, gap 180ms ease;
          min-width: 0;
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;
        }
        .source-composer--collapsed {
          overflow: hidden;
          min-width: 0;
          max-width: 100%;
        }
        .source-composer-collapsed {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
          box-sizing: border-box;
          animation: source-collapse-settle 180ms ease-out;
        }
        .source-composer-collapsed-preview {
          display: block;
          flex: 1 1 0%;
          width: 0;
          min-width: 0;
          max-width: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.9375rem;
          color: var(--color-ink);
          line-height: 1.4;
        }
        .source-composer-collapsed-actions {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.35rem;
          flex: 0 0 auto;
          flex-shrink: 0;
          min-width: max-content;
          position: relative;
          z-index: 1;
          /* Opaque so preview glyphs cannot show through the control group. */
          background: var(--color-paper-raised);
        }
        @keyframes source-collapse-settle {
          from {
            opacity: 0.65;
          }
          to {
            opacity: 1;
          }
        }
        .source-visually-hidden {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          clip-path: inset(50%) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
        .source-well {
          transition: background-color 150ms ease, border-color 150ms ease, outline-color 150ms ease, min-height 180ms ease, max-height 180ms ease;
        }
        .source-well-textarea {
          display: block !important;
          align-self: stretch;
          position: relative;
          z-index: 1;
          background: transparent !important;
          /* Keep typed text top-left; do not inherit flex centering from the ui Textarea. */
          place-content: unset;
          align-items: unset;
          justify-content: unset;
        }
        /* Primary action: the one button on the page allowed to have weight. */
        .adapt-primary {
          box-shadow:
            0 1px 2px color-mix(in srgb, var(--color-ink) 14%, transparent),
            inset 0 1px 0 color-mix(in srgb, var(--color-paper-raised) 18%, transparent);
          transition:
            background-color var(--motion-fast) ease,
            box-shadow var(--motion-fast) ease,
            transform var(--motion-fast) ease,
            opacity var(--motion-fast) ease;
        }
        .adapt-primary:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow:
            0 3px 10px -2px color-mix(in srgb, var(--color-ink) 28%, transparent),
            inset 0 1px 0 color-mix(in srgb, var(--color-paper-raised) 18%, transparent);
        }
        .adapt-primary:not(:disabled):active {
          transform: translateY(0);
          box-shadow: 0 1px 2px color-mix(in srgb, var(--color-ink) 14%, transparent);
        }

        /* Empty-state guide: anchors the page before a result exists. */
        /* Ray sits like a sticker over the panel's top-left corner; the panel's
           own padding clears it so the heading and steps stay on a clean grid. */
        .read-guide {
          --guide-ray: 6.25rem;
          position: relative;
          margin-top: 1.75rem;
          margin-left: 0.75rem;
          padding: 1.5rem 1.5rem 1.6rem calc(var(--guide-ray) * 0.72 + 1.5rem);
          padding-top: 1.55rem;
          border: 1px solid var(--color-paper-inset);
          border-radius: 1.15rem;
          background: color-mix(in srgb, var(--color-paper-raised) 72%, transparent);
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 1.35rem;
        }
        .read-guide-mascot {
          position: absolute;
          top: calc(var(--guide-ray) * -0.34);
          left: calc(var(--guide-ray) * -0.3);
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--guide-ray);
          height: var(--guide-ray);
          border-radius: 999px;
          background: var(--color-paper-raised);
          border: 1px solid var(--color-paper-inset);
          box-shadow:
            0 1px 2px color-mix(in srgb, var(--color-ink) 8%, transparent),
            0 14px 28px -16px color-mix(in srgb, var(--color-ink) 30%, transparent);
          transform: rotate(-6deg);
          transition: transform var(--motion-slow) ease;
        }
        .read-guide:hover .read-guide-mascot {
          transform: rotate(-2deg) translateY(-2px);
        }
        .read-guide-ray svg {
          width: calc(var(--guide-ray) * 0.66) !important;
          height: calc(var(--guide-ray) * 0.66) !important;
        }
        .read-guide-heading {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-height: calc(var(--guide-ray) * 0.5);
          justify-content: center;
        }
        .read-guide-eyebrow {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-action);
        }
        .read-guide-lede {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.3;
          color: var(--color-ink);
        }
        .read-guide-steps {
          list-style: none;
          /* Only the heading needs to clear Ray; steps take the full panel width. */
          margin: 0 0 0 calc(var(--guide-ray) * -0.72);
          padding: 1.25rem 0 0;
          border-top: 1px solid var(--color-paper-inset);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }
        .read-guide-step {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
          min-width: 0;
        }
        .read-guide-num {
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1.5px solid var(--color-action-border);
          color: var(--color-action);
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1;
        }
        .read-guide-title {
          margin: 0 0 0.2rem;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.005em;
          color: var(--color-ink);
        }
        .read-guide-body {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--color-ink-muted);
          text-wrap: pretty;
        }
        @media (max-width: 860px) {
          .read-guide {
            --guide-ray: 5.5rem;
            margin-left: 0.85rem;
            padding: 1.35rem 1.15rem 1.35rem;
          }
          /* Narrow: Ray softens into a glow that fades out to the right, so the
             heading can sit closer without a hard circle edge cutting into it. */
          .read-guide-mascot {
            border: 0;
            box-shadow: none;
            transform: none;
            background:
              radial-gradient(
                circle at 42% 46%,
                var(--color-paper-raised) 0%,
                var(--color-paper-raised) 38%,
                color-mix(in srgb, var(--color-paper-raised) 70%, transparent) 58%,
                transparent 78%
              );
          }
          .read-guide:hover .read-guide-mascot {
            transform: none;
          }
          .read-guide-heading {
            padding-left: calc(var(--guide-ray) * 0.53 - 1.15rem + 0.6rem);
          }
          .read-guide-lede {
            font-size: 1.125rem;
          }
          .read-guide-steps {
            margin-left: 0;
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .source-composer,
          .source-well,
          .adapt-primary {
            transition: none !important;
          }
          .adapt-primary:not(:disabled):hover {
            transform: none;
          }
          .read-guide-mascot,
          .read-guide:hover .read-guide-mascot {
            transition: none;
            transform: rotate(-6deg);
          }
          .source-composer-collapsed {
            animation: none !important;
          }
        }
      `}</style>
      <SignInDialog
        open={signInOpen}
        onOpenChange={(open) => {
          setSignInOpen(open);
          if (!open) saveAfterSignInRef.current = false;
        }}
        onSignIn={async (input) => {
          await authStore.signIn(input);
          const shouldSave = saveAfterSignInRef.current;
          saveAfterSignInRef.current = false;
          if (shouldSave) await persistPiece();
        }}
      />
    </main>
  );
}
