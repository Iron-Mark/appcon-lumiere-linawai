import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sindi } from "@/components/sindi";
import { Reveal } from "./Reveal";
import { HeroDemoCard } from "./HeroDemoCard";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="px-5 pt-16 pb-20 md:pt-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal className="font-ui flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-ink-muted">
          <span className="size-1.5 rounded-full bg-action" aria-hidden="true" />
          Now in beta for Chrome and the web
        </Reveal>

        <Reveal delay={80} className="mt-8">
          <h1
            id="hero-title"
            className="font-ui text-4xl font-semibold tracking-tight text-balance text-ink md:text-6xl md:leading-[1.1]"
          >
            <span className="gradient-headline">
              Adapt the format. Preserve the meaning.
            </span>{" "}
            <span className="ml-1 inline-flex translate-y-1 align-middle">
              <Sindi state="reading" line="" />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="font-ui mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-muted">
            Linaw turns any page into the view that works for you — then checks,
            line by line, that no condition, deadline, or warning got lost along
            the way.
          </p>
        </Reveal>

        <Reveal
          delay={240}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href="/onboarding"
            className="font-ui inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action px-6 text-base font-semibold text-paper-raised transition-colors hover:bg-action-hover sm:w-auto"
          >
            Open Linaw
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="#try-it"
            className="font-ui inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-action-border bg-transparent px-6 text-base font-semibold text-ink transition-colors hover:bg-action-soft sm:w-auto"
          >
            Try the live demo
          </Link>
        </Reveal>
      </div>

      <Reveal delay={340} className="mx-auto mt-14 max-w-3xl">
        <HeroDemoCard />
      </Reveal>
    </section>
  );
}
