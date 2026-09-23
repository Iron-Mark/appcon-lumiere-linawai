"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Character range in the *displayed* text currently being spoken. */
export type SpokenRange = { start: number; end: number };

export const LISTEN_RATES = [0.8, 1, 1.25, 1.5] as const;
export type ListenRate = (typeof LISTEN_RATES)[number];

const RATE_STORAGE_KEY = "linaw.listen.rate";

function loadRate(): ListenRate {
  if (typeof window === "undefined") return 1;
  try {
    const raw = window.localStorage.getItem(RATE_STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return (LISTEN_RATES as readonly number[]).includes(n) ? (n as ListenRate) : 1;
  } catch {
    return 1;
  }
}

/** Word end from a boundary index — some engines omit `charLength`. */
function wordEnd(text: string, from: number, charLength: number | undefined): number {
  if (charLength && charLength > 0) return Math.min(text.length, from + charLength);
  const rest = text.slice(from);
  const m = /^\S+/.exec(rest);
  return from + (m ? m[0].length : 1);
}

/**
 * Speaks the exact displayed adapted string via the Web Speech API.
 * Reports the word being spoken so the note can follow along, and supports
 * pause / resume and a reading speed. Speed changes restart from the current
 * word because the API cannot change rate mid-utterance.
 */
export function useListen(text: string) {
  const [listening, setListening] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRateState] = useState<ListenRate>(1);
  const [spoken, setSpoken] = useState<SpokenRange | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef(text);
  textRef.current = text;
  /** Text most recently handed to speak(), and where it sits in the displayed text. */
  const spokenTextRef = useRef<string>("");
  const baseOffsetRef = useRef(0);
  const lastBoundaryRef = useRef<number>(0);
  const rateRef = useRef<ListenRate>(1);

  useEffect(() => {
    const r = loadRate();
    rateRef.current = r;
    setRateState(r);
  }, []);

  const supported =
    typeof window !== "undefined" && Boolean(window.speechSynthesis);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setListening(false);
    setPaused(false);
    setSpoken(null);
  }, [supported]);

  /**
   * Speak `full` starting at absolute character `from`.
   * Boundaries are reported in the coordinates of `full`.
   */
  const speakFrom = useCallback(
    (full: string, from: number) => {
      if (!supported) return;
      const slice = full.slice(from);
      const leading = slice.length - slice.trimStart().length;
      const spokenText = slice.trim();
      if (!spokenText) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = rateRef.current;
      utteranceRef.current = utterance;
      spokenTextRef.current = full;
      baseOffsetRef.current = from + leading;
      lastBoundaryRef.current = baseOffsetRef.current;

      utterance.onboundary = (event) => {
        if (utteranceRef.current !== utterance) return;
        if (event.name && event.name !== "word") return;
        const start = baseOffsetRef.current + event.charIndex;
        const end = wordEnd(full, start, event.charLength);
        lastBoundaryRef.current = start;
        setSpoken({ start, end });
      };
      utterance.onend = () => {
        if (utteranceRef.current !== utterance) return;
        utteranceRef.current = null;
        setListening(false);
        setPaused(false);
        setSpoken(null);
      };
      utterance.onerror = () => {
        if (utteranceRef.current !== utterance) return;
        utteranceRef.current = null;
        setListening(false);
        setPaused(false);
        setSpoken(null);
      };

      setListening(true);
      setPaused(false);
      setSpoken(null);
      window.speechSynthesis.speak(utterance);
    },
    [stop, supported],
  );

  const start = useCallback(
    (overrideText?: string) => {
      const full = overrideText ?? textRef.current;
      if (!full.trim()) return;
      speakFrom(full, 0);
    },
    [speakFrom],
  );

  const pause = useCallback(() => {
    if (!supported || !utteranceRef.current) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported || !utteranceRef.current) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  const togglePause = useCallback(() => {
    if (paused) resume();
    else pause();
  }, [paused, pause, resume]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  const setRate = useCallback(
    (next: ListenRate) => {
      rateRef.current = next;
      setRateState(next);
      try {
        window.localStorage.setItem(RATE_STORAGE_KEY, String(next));
      } catch {
        // Preference is a convenience; ignore storage failures.
      }
      // Mid-read: restart from the word we were on so the change is audible now.
      if (utteranceRef.current) {
        speakFrom(spokenTextRef.current, lastBoundaryRef.current);
      }
    },
    [speakFrom],
  );

  const cycleRate = useCallback(() => {
    const i = LISTEN_RATES.indexOf(rateRef.current);
    setRate(LISTEN_RATES[(i + 1) % LISTEN_RATES.length]!);
  }, [setRate]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    supported,
    listening,
    paused,
    spoken,
    rate,
    start,
    stop,
    toggle,
    pause,
    resume,
    togglePause,
    setRate,
    cycleRate,
  };
}
