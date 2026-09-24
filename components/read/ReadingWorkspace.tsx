"use client";

import { track } from "@vercel/analytics";
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
import {
  adapt,
  FLAGGED_SAMPLE_SOURCE,
  getAdapterInfo,
  getDevelopmentSampleSource,
  type AdapterInfo,
} from "@/lib/adapt";
import { stashPendingPieceSave } from "@/lib/content/pendingSave";
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
import { LINAW_PREFERENCES_CHANGED_EVENT } from "@/lib/storage/preferences-sync";
import { Sindi, type SindiState } from "@/components/sindi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bookmark,
  Check,
  Clipboard,
  Copy,
  Link2,
  Paperclip,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { ErrorToast } from "./ErrorToast";
import { ModeBar } from "./ModeBar";
import { buildShareLink } from "./shareLink";
import { MeaningCheckRail } from "./MeaningCheckRail";
import { NoteCard, type NoteView } from "./NoteCard";
import { buildMarks, warningLineForChecks } from "./marks";
import { statusLabel } from "./AdaptedText";
import { useListen } from "./useListen";
import {
  enforceSourceLength,
  readSourceFile,
  sanitizeSourceText,
  toPlainSource,
  SOURCE_UPLOAD_ACCEPT,
  SOURCE_UPLOAD_LIMITS_ID,
  SOURCE_UPLOAD_LIMITS_TEXT,
} from "./readSourceFile";

const ADAPT_FAILED_MESSAGE = "Could not clarify this note.";
/** Layout choice for the note (text / at a glance / one at a time). */
const VIEW_STORAGE_KEY = "linaw.read.view";
const GUIDE_HIDDEN_KEY = "linaw.read.guide-hidden";
const NOTE_VIEW_VALUES: NoteView[] = ["text", "glance", "focus"];
/** Draft survives a reload during a demo; cleared when the source is cleared. */
const DRAFT_STORAGE_KEY = "linaw.read.draft";

type ReadingWorkspaceProps = {
  /** Piece id from /read?piece= — loads that saved source. */
  pieceId?: string | null;
  /** Decoded source from /read?s= — someone shared it; adapt in this reader's preferences. */
  sharedSource?: string | null;
};

export function ReadingWorkspace({
  pieceId = null,
  sharedSource = null,
}: ReadingWorkspaceProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [prefsReady, setPrefsReady] = useState(false);
  const [hasStoredPrefs, setHasStoredPrefs] = useState(false);
  /** null until we know whether the how-it-works panel was dismissed. */
  const [guideHidden, setGuideHidden] = useState<boolean | null>(null);

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
  const loadedPieceRef = useRef<string | null>(null);
  const openedFromPieceRef = useRef(false);
  const stopListenRef = useRef<() => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Last adapt() request that threw — offered back as Retry in the error toast. */
  const failedRunRef = useRef<{
    source: string;
    prefs: Preferences;
    options?: { fixtureSample?: boolean; autoListen?: boolean };
  } | null>(null);

  const displayedText = result?.adaptedText ?? "";
  const {
    listening,
    paused: listenPaused,
    spoken,
    settings: listenSettings,
    voices: listenVoices,
    listenNote,
    start: startListen,
    stop: stopListen,
    toggle: toggleListen,
    togglePause: toggleListenPause,
    updateSettings: updateListenSettings,
  } = useListen(displayedText);
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

    const onExternalPrefs = (event: Event) => {
      const detail = (event as CustomEvent<Preferences>).detail;
      if (!detail || cancelled) return;
      setPreferences(detail);
      setHasStoredPrefs(true);
    };
    window.addEventListener(LINAW_PREFERENCES_CHANGED_EVENT, onExternalPrefs);

    return () => {
      cancelled = true;
      window.removeEventListener(LINAW_PREFERENCES_CHANGED_EVENT, onExternalPrefs);
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

  const dismissError = useCallback(() => setError(null), []);

  const retryAdapt = useCallback(() => {
    const failed = failedRunRef.current;
    if (!failed) return;
    failedRunRef.current = null;
    setError(null);
    setResultsRevealed(true);
    void runAdaptRef.current?.(failed.source, failed.prefs, failed.options);
  }, []);
  const errorAction = error && failedRunRef.current
    ? { label: "Retry", onClick: retryAdapt }
    : null;

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
      const checked = enforceSourceLength(toPlainSource(raw));
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
      } catch (err) {
        if (generation !== adaptGeneration.current) return;
        setWorking(false);
        // Keep the exact failed request so the toast can offer Retry.
        failedRunRef.current = { source, prefs, options };
        const message =
          err instanceof Error && err.message.trim()
            ? err.message.trim()
            : ADAPT_FAILED_MESSAGE;
        setError(message);
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

  /** Shared link: load the sender's source and adapt it in *this* reader's preferences. */
  const loadedSharedRef = useRef<string | null>(null);
  const [openedFromShare, setOpenedFromShare] = useState(false);
  useEffect(() => {
    if (!prefsReady || !sharedSource || pieceId) return;
    if (loadedSharedRef.current === sharedSource) return;
    loadedSharedRef.current = sharedSource;
    const checked = enforceSourceLength(sanitizeSourceText(sharedSource));
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    setDraftSource(checked.text);
    setComposerExpanded(false);
    setOpenedFromShare(true);
    setError(null);
    setSaveNotice(null);
    void runAdaptRef.current?.(checked.text, preferencesRef.current, {
      fixtureSample: false,
    });
  }, [sharedSource, pieceId, prefsReady]);

  /** Restore an unsent draft after a reload; pieces and shared links take priority. */
  const draftRestoredRef = useRef(false);
  useEffect(() => {
    if (!prefsReady || draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    if (pieceId || sharedSource) return;
    try {
      const saved = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved && saved.trim() && !draftSource) {
        setDraftSource(saved);
        setUploadStatus("Restored your unsent draft.");
      }
    } catch {
      // sessionStorage unavailable — nothing to restore.
    }
    // draftSource intentionally read once at restore time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsReady, pieceId, sharedSource]);

  useEffect(() => {
    if (!draftRestoredRef.current) return;
    try {
      if (draftSource.trim()) {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, draftSource);
      } else {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Best effort only.
    }
  }, [draftSource]);

  /** Copy the clarified text itself, for pasting into a group chat or reply. */
  const [noteCopied, setNoteCopied] = useState(false);
  const noteCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCopyNote = useCallback(async () => {
    const text = displayedText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setNoteCopied(true);
      setUploadStatus("Clarified note copied.");
      if (noteCopiedTimerRef.current) clearTimeout(noteCopiedTimerRef.current);
      noteCopiedTimerRef.current = setTimeout(() => setNoteCopied(false), 1600);
    } catch {
      setError("Could not copy the note. Select the text and copy it yourself.");
    }
  }, [displayedText]);
  useEffect(() => {
    return () => {
      if (noteCopiedTimerRef.current) clearTimeout(noteCopiedTimerRef.current);
    };
  }, []);

  /**
   * Who will handle the next adaptation. Asked once so the composer can say,
   * before anything is sent, whether the text goes to a language model.
   */
  const [adapterInfo, setAdapterInfo] = useState<AdapterInfo | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getAdapterInfo().then((info) => {
      if (!cancelled) setAdapterInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    try {
      setGuideHidden(window.localStorage.getItem(GUIDE_HIDDEN_KEY) === "1");
    } catch {
      setGuideHidden(false);
    }
  }, []);
  const modelWillBeUsed = adapterInfo?.adapter === "model";
  const resultFromModel = result?.adapter === "model";

  /** Note layout — remembered across sessions like the other reading choices. */
  const [noteView, setNoteView] = useState<NoteView>("text");
  const [noteViewHydrated, setNoteViewHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (raw && (NOTE_VIEW_VALUES as string[]).includes(raw)) {
        setNoteView(raw as NoteView);
      }
    } catch {
      // Fine — default to text until prefs can seed.
    } finally {
      setNoteViewHydrated(true);
    }
  }, []);
  /** First arrival after onboarding: Key Points opens glance; Full opens text. */
  useEffect(() => {
    if (!prefsReady || !noteViewHydrated || !hasStoredPrefs) return;
    try {
      const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (raw && (NOTE_VIEW_VALUES as string[]).includes(raw)) return;
      const seeded: NoteView =
        preferences.detail === "key_points" ? "glance" : "text";
      setNoteView(seeded);
      window.localStorage.setItem(VIEW_STORAGE_KEY, seeded);
    } catch {
      // Best effort.
    }
  }, [
    prefsReady,
    noteViewHydrated,
    hasStoredPrefs,
    preferences.detail,
  ]);
  const onNoteViewChange = useCallback((next: NoteView) => {
    setNoteView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Best effort.
    }
  }, []);

  /** Narrow screens: the rail stacks below the note; take the reader there. */
  const jumpToChecks = useCallback(() => {
    const el = document.getElementById("meaning-check");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }, []);

  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCopyShareLink = useCallback(async () => {
    if (activeSource === null) return;
    const built = buildShareLink(activeSource, window.location.origin);
    if (!built.ok) {
      setError(built.reason);
      return;
    }
    try {
      await navigator.clipboard.writeText(built.url);
      setShareState("copied");
      setUploadStatus("Share link copied.");
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      shareTimerRef.current = setTimeout(() => setShareState("idle"), 1600);
    } catch {
      setError("Could not copy the link. Copy it from the address bar instead.");
    }
  }, [activeSource]);
  useEffect(() => {
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

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
      setSaveNotice("Clarify this source before saving.");
      return;
    }
    const user = await authStore.getUser();
    if (!user) {
      stashPendingPieceSave({
        id: activePieceId,
        source,
        status: statusFromOverall(result.overallStatus),
      });
      router.push("/account?next=/read");
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
    track("Clarify", {
      detail: preferences.detail,
      wording: preferences.wording,
    });
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

  /**
   * The flagged example is a deliberately wrong adaptation of the campus notice
   * ("All members arrive at 8:30 AM"). It exists so people can see Meaning Check
   * catch something, not just pass everything. Runs immediately.
   */
  const onLoadFlaggedSample = () => {
    const source = FLAGGED_SAMPLE_SOURCE;
    setDraftSource(source);
    setError(null);
    setUploadStatus("Flagged example loaded and checked.");
    setComposerExpanded(false);
    setResultsRevealed(true);
    void runAdapt(source, preferences, {
      fixtureSample: false,
      autoListen: false,
    });
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
      const incoming = toPlainSource(clip);
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

  /**
   * True when the adapter's meaning map is not traceable to the text that was
   * sent. A live model can return facts that are not in the paste.
   * The offline fixture no longer substitutes the campus example for other text.
   *
   * Exception: the flagged sample source is intentionally short and is checked
   * against the campus-pilot Meaning Map so Meaning Check can show real evidence
   * for the seeded wrong-group warning. That mismatch is expected, not a miss.
   */
  const resultUngrounded = useMemo(() => {
    if (!result || working) return false;
    const source = (activeSource ?? "").trim();
    if (!source) return false;
    const normalize = (s: string) =>
      s.replace(/\s+/g, " ").trim().replace(/\.$/, "").toLowerCase();
    if (normalize(source) === normalize(FLAGGED_SAMPLE_SOURCE)) return false;
    const haystack = normalize(source);
    const evidence = result.meaningMap.criticalFacts
      .map((f) => normalize(f.evidence))
      .filter((e) => e.length >= 8);
    if (evidence.length === 0) return false;
    return !evidence.some((e) => haystack.includes(e));
  }, [result, working, activeSource]);

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
    preferences.wording === "original"
      ? "Original"
      : preferences.wording === "taglish"
        ? "Taglish"
        : "Plain Language";
  const deliveryLabel =
    preferences.delivery === "listen" ? "Listen" : "Read";

  const baseStatusLine = statusLabel(
    result?.overallStatus ?? null,
    working,
    listening,
    detailLabel,
    wordingLabel,
  );
  // The live model reasons before it answers; set expectations so the wait reads as work, not a hang.
  const statusLine =
    working && modelWillBeUsed
      ? "Clarifying with the model… this can take up to a minute."
      : baseStatusLine;

  /** Evidence of the selected check, highlighted in the original view (spec 03). */
  const originalHighlight = useMemo(() => {
    if (!result || selectedIndex == null) return null;
    const check = result.checks[selectedIndex];
    if (!check) return null;
    const caution =
      check.status === "warning" || check.status === "repair_required";
    const original = originalForDisplay.toLowerCase();
    const present = (s: string) =>
      s.trim().length >= 8 && original.includes(s.trim().toLowerCase());

    if (present(check.evidence)) return { text: check.evidence, caution };
    // Fall back to the critical fact the claim is about (e.g. "… → Friday at 8:30 AM").
    const fact = result.meaningMap.criticalFacts.find(
      (f) =>
        f.value &&
        f.value.trim().length >= 2 &&
        check.claim.includes(f.value) &&
        present(f.evidence),
    );
    return fact ? { text: fact.evidence, caution } : null;
  }, [result, selectedIndex, originalForDisplay]);

  const onSelectCheck = (index: number | null) => {
    setSelectedIndex(index);
    if (index == null) return;
    const reduceMotion = prefersReducedMotion();
    const scrollOpts: ScrollIntoViewOptions = {
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    };
    const markEl = document.getElementById(`adapted-mark-${index}`);
    markEl?.scrollIntoView(scrollOpts);
    markEl?.focus({ preventScroll: true });
    // The rail may need a render to unfold the card (or swap to the original
    // view's evidence highlight) before there is anything to scroll to.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById(`meaning-check-card-${index}`)
          ?.scrollIntoView(scrollOpts);
        document
          .getElementById("original-evidence")
          ?.scrollIntoView(scrollOpts);
      });
    });
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

  // The textarea is the card: a single sheet of paper. Dashes only appear
  // while something is being dragged over it, so the resting state reads
  // as a place to write, not a file-upload zone.
  const wellBorder = sourceDropActive
    ? "2px dashed var(--color-action-border)"
    : sourceSettled
      ? "1px solid var(--color-action)"
      : "1px solid var(--color-paper-inset)";

  const wellBackground = sourceDropActive
    ? "color-mix(in srgb, var(--color-action-soft) 55%, var(--color-paper-raised))"
    : sourceSettled
      ? "color-mix(in srgb, var(--color-action-soft) 30%, var(--color-paper-raised))"
      : "var(--color-paper-raised)";

  const sourceIconClassName =
    "source-well-icon size-10 min-h-10 min-w-10 shrink-0 cursor-pointer rounded-lg text-ink-muted hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-ring/60";

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
            Clarify a message, then check the meaning.
          </p>
          <Link
            href="/todo"
            className="font-ui mt-2 inline-flex min-h-11 items-center text-sm text-ink-muted underline decoration-border underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            What Linaw runs
          </Link>
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
          gap: "0.6rem",
          padding: composerExpanded ? 0 : "0.6rem 0.75rem",
          background: composerExpanded
            ? "transparent"
            : "color-mix(in srgb, var(--color-paper-inset) 55%, transparent)",
          borderRadius: "0.85rem",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {composerExpanded ? (
          <div
            className={`source-well source-sheet${sourceDropActive ? " source-well--drop" : ""}${sourceSettled ? " source-well--settled" : ""}`}
            onDragOver={onSourceDragOver}
            onDragLeave={onSourceDragLeave}
            onDrop={onSourceDrop}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              background: wellBackground,
              border: wellBorder,
              borderRadius: "1.1rem",
              outline: sourceDropActive
                ? "2px solid var(--color-action)"
                : undefined,
              outlineOffset: sourceDropActive ? "3px" : undefined,
            }}
          >
            <div
              className="source-sheet-body"
              style={{
                position: "relative",
                minHeight: "11rem",
                maxHeight: "18rem",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "1.1rem 1.1rem 0 0",
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
                    gap: "0.4rem",
                    padding: "1.25rem",
                    pointerEvents: "none",
                    textAlign: "center",
                  }}
                >
                  <span
                    className="font-reading"
                    style={{
                      fontSize: "1.375rem",
                      fontWeight: 600,
                      color: "var(--color-ink)",
                      letterSpacing: "-0.012em",
                    }}
                  >
                    {sourceDropActive
                      ? "Drop it here"
                      : "Paste or drop a message"}
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
                onKeyDown={(event) => {
                  // Ctrl/⌘+Enter runs the primary action without leaving the keyboard.
                  if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey) &&
                    !working &&
                    draftHasText
                  ) {
                    event.preventDefault();
                    onAdaptDraft();
                  }
                }}
                rows={6}
                aria-label="Source text"
                placeholder={
                  showEmptyPrompt
                    ? undefined
                    : "Paste or enter the message to clarify…"
                }
                className={`font-ui source-well-textarea [field-sizing:fixed] block min-h-[11rem] max-h-72 w-full max-w-full flex-1 resize-none overflow-y-auto cursor-text rounded-none border-0 bg-transparent px-5 pb-4 pt-4 text-base leading-relaxed text-ink shadow-none placeholder:text-ink-muted focus-visible:border-0 focus-visible:ring-0 md:text-base ${
                  draftHasText ? "pr-14" : ""
                }`}
              />
              {draftHasText ? (
                <div
                  className="source-well-clear"
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    zIndex: 2,
                  }}
                >
                  {clearSourceButton}
                </div>
              ) : null}
            </div>

            {/* Toolbar is part of the sheet: tools on the left, the one action on the right. */}
            <div
              className="source-sheet-footer"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem 0.75rem",
                padding: "0.6rem 0.75rem 0.6rem 0.85rem",
                borderTop: "1px solid var(--color-paper-inset)",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.15rem",
                }}
              >
                {sourceBottomIcons}
                <span
                  aria-hidden="true"
                  style={{
                    width: 1,
                    height: "1.25rem",
                    margin: "0 0.4rem",
                    background: "var(--color-paper-inset)",
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onLoadSample}
                  disabled={working}
                  className="min-h-10 cursor-pointer rounded-lg px-3 font-ui text-[0.875rem] font-medium text-ink-muted hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  Use an example
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onLoadFlaggedSample}
                  disabled={working}
                  title="A deliberately wrong version of the example, so you can see Meaning Check catch it"
                  className="min-h-10 cursor-pointer gap-1.5 rounded-lg px-3 font-ui text-[0.875rem] font-medium text-ink-muted hover:bg-warning-soft hover:text-warning focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <AlertTriangle aria-hidden className="size-3.5" strokeWidth={2.25} />
                  Try a flagged example
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
                title="Ctrl+Enter / ⌘+Enter"
                className="adapt-primary min-h-11 min-w-11 cursor-pointer px-5 font-ui text-[0.9375rem] font-semibold focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Clarify
              </Button>
            </div>
            {modelWillBeUsed ? (
              <p
                className="font-ui"
                style={{
                  margin: 0,
                  padding: "0 0.95rem 0.65rem",
                  fontSize: "0.75rem",
                  lineHeight: 1.45,
                  color: "var(--color-ink-subtle)",
                }}
              >
                When you clarify, this text is sent to a language model. Every
                critical fact in the result is checked back against your text
                before you see it.
              </p>
            ) : null}
          </div>
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
              {result ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onAdaptDraft}
                  disabled={working || !draftHasText}
                  aria-disabled={working || !draftHasText}
                  aria-label="Clarify again"
                  className="source-well-icon size-11 min-h-11 min-w-11 shrink-0 cursor-pointer text-ink-muted hover:bg-transparent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  onClick={onAdaptDraft}
                  disabled={working || !draftHasText}
                  aria-disabled={working || !draftHasText}
                  aria-describedby={
                    !draftHasText ? "adapt-disabled-reason" : undefined
                  }
                  className="adapt-primary min-h-10 shrink-0 cursor-pointer px-4 font-ui text-[0.875rem] font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  Clarify
                </Button>
              )}
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
            Clarify is unavailable until you enter, paste, or upload source text.
          </p>
        ) : null}

        <div
          aria-live="polite"
          aria-atomic="true"
          className="source-visually-hidden"
        >
          {uploadStatus}
        </div>

      </section>

      <ErrorToast message={error} onDismiss={dismissError} action={errorAction} />

      {!showResultsGrid && guideHidden === false ? (
        <section
          aria-label="How Linaw works"
          className="read-guide animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none"
          style={{ animationDelay: "80ms" }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Hide how Linaw works"
            className="read-guide-close size-11 min-h-11 min-w-11 cursor-pointer text-ink-muted hover:bg-transparent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring/60"
            onClick={() => {
              setGuideHidden(true);
              try {
                window.localStorage.setItem(GUIDE_HIDDEN_KEY, "1");
              } catch {
                // Hidden for this view even if storage is blocked.
              }
            }}
          >
            <X aria-hidden="true" />
          </Button>
          <div className="read-guide-mascot" aria-hidden="true">
            <Sindi state="empty" line="" size={96} className="read-guide-ray" />
          </div>
          <div className="read-guide-heading">
            <p className="read-guide-eyebrow">How Linaw works</p>
            <p className="read-guide-lede font-reading">
              Paste, clarify, then check the meaning held.
            </p>
          </div>
          <ol className="read-guide-steps">
            {[
              {
                title: "Paste or drop",
                body: "Plain text or a PDF, up to 30 pages long.",
              },
              {
                title: "Clarify",
                body: "Rewritten to your detail and wording choices.",
              },
              {
                title: "Meaning Check",
                body: "Key facts are checked against the source.",
              },
            ].map((step, i) => (
              <li key={step.title} className="read-guide-step">
                <span
                  aria-hidden="true"
                  className="read-guide-num font-reading"
                >
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
            {resultUngrounded ? (
              <div
                role="status"
                className="font-ui animate-in fade-in-0 duration-300 fill-mode-both motion-reduce:animate-none"
                style={{
                  display: "flex",
                  gap: "0.65rem",
                  alignItems: "flex-start",
                  marginBottom: "1.1rem",
                  padding: "0.8rem 0.95rem",
                  borderRadius: "0.75rem",
                  background: "var(--color-warning-soft)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-warning-border) 45%, transparent)",
                  color: "var(--color-ink)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                <AlertTriangle
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: "var(--color-warning)" }}
                  strokeWidth={2.25}
                />
                <p style={{ margin: 0 }}>
                  <strong style={{ fontWeight: 600 }}>
                    This note was not produced from your text.
                  </strong>{" "}
                  {resultFromModel
                    ? "The model's facts could not be traced back to what you pasted, so the checks below are not about your text. Try again, or review the original."
                    : "The adapter returned the built-in example instead. The live model may be unavailable or not connected in this build. The checks below refer to that example, not to what you pasted."}
                </p>
              </div>
            ) : null}
            <NoteCard
              title="Clarified note"
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
              listenPaused={listenPaused}
              onTogglePause={toggleListenPause}
              listenSettings={listenSettings}
              listenVoices={listenVoices}
              onListenChange={updateListenSettings}
              listenNote={listenNote}
              spoken={spoken}
              originalHighlight={originalHighlight}
              onJumpToChecks={jumpToChecks}
              view={noteView}
              onViewChange={onNoteViewChange}
              meaningMap={result?.meaningMap ?? null}
              checks={result?.checks ?? null}
              onSelectCheck={onSelectCheck}
              onSpeakText={(text) => startListen(text)}
              onStopSpeaking={stopListen}
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
                  disabled={alreadySaved || !sourceMatchesAdapt || resultUngrounded}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onCopyShareLink()}
                  disabled={!sourceMatchesAdapt || resultUngrounded}
                  aria-label="Copy a link that opens this source for someone else, in their own reading preferences"
                  className="font-ui h-10 min-h-10 cursor-pointer gap-2 rounded-lg px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {shareState === "copied" ? (
                    <Check
                      aria-hidden
                      className="size-4 text-action"
                      strokeWidth={2.25}
                    />
                  ) : (
                    <Link2 aria-hidden className="size-4" strokeWidth={2} />
                  )}
                  {shareState === "copied" ? "Link copied" : "Share link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void onCopyNote()}
                  disabled={!displayedText.trim()}
                  aria-label="Copy the clarified note text"
                  className="font-ui h-10 min-h-10 cursor-pointer gap-2 rounded-lg px-3 text-sm font-medium text-ink-muted hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {noteCopied ? (
                    <Check
                      aria-hidden
                      className="size-4 text-action"
                      strokeWidth={2.25}
                    />
                  ) : (
                    <Copy aria-hidden className="size-4" strokeWidth={2} />
                  )}
                  {noteCopied ? "Copied" : "Copy note"}
                </Button>
                {openedFromShare && !saveNotice ? (
                  <p
                    className="font-ui"
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    Shared with you — shown in your own reading preferences.
                  </p>
                ) : null}
                <p
                  className="font-ui"
                  style={{
                    margin: 0,
                    flexBasis: "100%",
                    fontSize: "0.75rem",
                    lineHeight: 1.45,
                    color: "var(--color-ink-subtle)",
                  }}
                >
                  {resultFromModel
                    ? "Clarified by a language model from your text, then checked fact by fact against it."
                    : "Clarified by the built-in offline adapter, then checked fact by fact against the source."}
                </p>
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
                    Clarify this source before saving.
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
          .read-page-header {
            align-items: flex-start;
          }
          .read-note-surface,
          .read-meaning-rail {
            padding: 1.1rem 1rem 1.15rem !important;
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
          /* Opaque so preview glyphs cannot show through the control group;
             matches the collapsed strip's own fill. */
          background: color-mix(in srgb, var(--color-paper-inset) 55%, var(--color-paper-raised));
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
        /* The sheet: one raised piece of paper, lifting slightly when written on. */
        .source-sheet {
          box-shadow:
            0 1px 2px color-mix(in srgb, var(--color-ink) 6%, transparent),
            0 12px 32px -18px color-mix(in srgb, var(--color-ink) 22%, transparent);
          transition:
            box-shadow var(--motion-base) ease,
            border-color var(--motion-fast) ease,
            background-color var(--motion-fast) ease;
        }
        .source-sheet:focus-within {
          border-color: var(--color-action-border) !important;
          box-shadow:
            0 0 0 3px color-mix(in srgb, var(--color-action) 16%, transparent),
            0 1px 2px color-mix(in srgb, var(--color-ink) 6%, transparent),
            0 16px 40px -20px color-mix(in srgb, var(--color-ink) 28%, transparent);
        }
        .source-sheet.source-well--drop {
          box-shadow:
            0 0 0 6px color-mix(in srgb, var(--color-action) 12%, transparent),
            0 16px 40px -20px color-mix(in srgb, var(--color-ink) 28%, transparent);
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
          --guide-ray: 8rem;
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
        .read-guide-close {
          position: absolute;
          top: 0.45rem;
          right: 0.45rem;
          z-index: 2;
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
            --guide-ray: 6.75rem;
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
    </main>
  );
}
