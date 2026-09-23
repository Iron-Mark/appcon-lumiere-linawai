"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Transition delay in milliseconds. */
  delay?: number;
  as?: "div" | "li";
};

/**
 * Scroll-triggered reveal without extra dependencies.
 * Renders visible immediately when IntersectionObserver is unavailable
 * or when the user prefers reduced motion.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement | HTMLLIElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      const prefersReduced = motionQuery.matches;
      setReducedMotion(prefersReduced);
      if (prefersReduced) {
        setVisible(true);
      }
    };

    applyMotionPreference();
    motionQuery.addEventListener("change", applyMotionPreference);

    return () => motionQuery.removeEventListener("change", applyMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const style =
    !reducedMotion && delay ? { transitionDelay: `${delay}ms` } : undefined;

  if (as === "li") {
    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        style={style}
        className={cn(
          "reveal motion-reduce:opacity-100 motion-reduce:transform-none motion-reduce:transition-none",
          visible && "reveal-visible",
          className,
        )}
      >
        {children}
      </li>
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={style}
      className={cn(
        "reveal motion-reduce:opacity-100 motion-reduce:transform-none motion-reduce:transition-none",
        visible && "reveal-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
