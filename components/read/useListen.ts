"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speaks the exact displayed adapted string via the Web Speech API.
 */
export function useListen(text: string) {
  const [listening, setListening] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback((overrideText?: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const trimmed = (overrideText ?? textRef.current).trim();
    if (!trimmed) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utteranceRef.current = utterance;
    utterance.onend = () => {
      utteranceRef.current = null;
      setListening(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setListening(false);
    };
    setListening(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { listening, start, stop, toggle };
}
