"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LINAW_VOICE_ID } from "@/lib/listen/rank";
import { speakLinawVoice, stopLinawVoice } from "@/lib/listen/linaw-voice";
import { loadLinawTts } from "@/lib/listen/linaw-voice-web";
import {
  applyListenSettings,
  DEFAULT_LISTEN_SETTINGS,
  loadListenSettings,
  normalizeListenSettings,
  saveListenSettings,
  type ListenPitch,
  type ListenRate,
  type ListenSettings,
  type ListenVoice,
} from "@/lib/listen/settings";
import { rankListenVoices } from "@/lib/listen/rank";

export type { ListenPitch, ListenRate, ListenSettings, ListenVoice };

/** Character range in the *displayed* text currently being spoken. */
export type SpokenRange = { start: number; end: number };

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
  const [settings, setSettings] = useState<ListenSettings>(DEFAULT_LISTEN_SETTINGS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [spoken, setSpoken] = useState<SpokenRange | null>(null);
  const [listenNote, setListenNote] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef(text);
  textRef.current = text;
  /** Text most recently handed to speak(), and where it sits in the displayed text. */
  const spokenTextRef = useRef<string>("");
  const baseOffsetRef = useRef(0);
  const lastBoundaryRef = useRef<number>(0);
  const settingsRef = useRef<ListenSettings>(DEFAULT_LISTEN_SETTINGS);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const listenGen = useRef(0);
  const supported =
    typeof window !== "undefined" && Boolean(window.speechSynthesis);

  useEffect(() => {
    const loaded = loadListenSettings();
    settingsRef.current = loaded;
    setSettings(loaded);
  }, []);

  useEffect(() => {
    if (!supported) return;
    const refresh = () => {
      const next = window.speechSynthesis.getVoices();
      voicesRef.current = next;
      setVoices(next);
    };
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, [supported]);

  const stop = useCallback(() => {
    listenGen.current += 1;
    stopLinawVoice();
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
    (full: string, from: number, deviceFallback = false) => {
      if (
        settingsRef.current.voiceURI === LINAW_VOICE_ID &&
        !deviceFallback
      ) {
        const slice = full.slice(from).trim();
        if (!slice) {
          stop();
          return;
        }
        const gen = listenGen.current;
        setListening(true);
        setListenNote(null);
        void speakLinawVoice(
          slice,
          settingsRef.current.rate,
          settingsRef.current.pitch,
          { onNote: setListenNote, load: loadLinawTts },
        ).then((ok) => {
          if (gen !== listenGen.current) return;
          if (!ok) speakFrom(full, from, true);
          else {
            setListening(false);
            setListenNote(null);
          }
        });
        return;
      }
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
      const listed: ListenVoice[] = voicesRef.current.map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
      }));
      const applied = { rate: 1, pitch: 1, voice: null as ListenVoice | null };
      applyListenSettings(applied, settingsRef.current, listed);
      utterance.rate = applied.rate;
      utterance.pitch = applied.pitch;
      if (applied.voice) {
        const match = voicesRef.current.find(
          (voice) => voice.voiceURI === applied.voice?.voiceURI,
        );
        if (match) utterance.voice = match;
      }
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

  const updateSettings = useCallback(
    (patch: Partial<ListenSettings>) => {
      const next = normalizeListenSettings({ ...settingsRef.current, ...patch });
      settingsRef.current = next;
      setSettings(next);
      saveListenSettings(next);
      if (utteranceRef.current) {
        speakFrom(spokenTextRef.current, lastBoundaryRef.current);
      }
    },
    [speakFrom],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const listedVoices: ListenVoice[] = rankListenVoices(
    voices
      .filter((voice) => voice.voiceURI)
      .map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        default: voice.default,
      })),
  );

  return {
    supported,
    listening,
    paused,
    spoken,
    settings,
    voices: listedVoices,
    listenNote,
    start,
    stop,
    toggle,
    pause,
    resume,
    togglePause,
    updateSettings,
  };
}
