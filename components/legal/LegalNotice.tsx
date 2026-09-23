"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = "terms" | "privacy";

const TABS: { id: Tab; label: string }[] = [
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
];

export function LegalNotice({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);

  function select(next: Tab) {
    setTab(next);
    router.replace(next === "privacy" ? "/legal?tab=privacy" : "/legal?tab=terms", {
      scroll: false,
    });
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = tab === "terms" ? "privacy" : "terms";
    select(next);
    document.getElementById(`legal-tab-${next}`)?.focus();
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[42rem] flex-col gap-8 px-5 py-10 text-left sm:px-8 sm:py-14">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="font-ui w-fit text-sm font-medium text-ink-muted hover:text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Linaw AI
        </Link>
        <h1 className="font-reading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Terms and privacy
        </h1>
        <p className="font-ui text-sm leading-relaxed text-ink-muted sm:text-base">
          This notice is written by the Linaw team for a free build entered in
          AppCon 2026. It is not a law-firm document, and Linaw is not a
          registered company.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Legal notices"
        className="font-ui flex gap-2"
        onKeyDown={onTabKeyDown}
      >
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              id={`legal-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`legal-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={`min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                selected
                  ? "bg-action text-paper-raised"
                  : "border border-border bg-paper-raised text-ink hover:bg-paper-inset"
              }`}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "terms" ? <TermsPanel /> : <PrivacyPanel />}
    </main>
  );
}

function TermsPanel() {
  return (
    <article
      id="legal-panel-terms"
      role="tabpanel"
      aria-labelledby="legal-tab-terms"
      className="font-ui flex flex-col gap-6 text-sm leading-relaxed text-ink sm:text-base"
    >
      <Section n="1" title="What Linaw is">
        Linaw rewrites one notice, email, or lesson into the detail, wording,
        and delivery you chose, then runs Meaning Check against the source.
        It is not a lawyer, a doctor, a school, or a government office. A pass
        on Meaning Check is not a guarantee that every meaning survived.
      </Section>
      <Section n="2" title="Who runs it">
        The Linaw team runs this app for AppCon 2026. OTis Philippines Inc.
        organizes that contest. OTis does not operate your notes, and it does
        not receive the text you paste unless you yourself send it somewhere
        else.
      </Section>
      <Section n="3" title="Using the app">
        An account is optional. If you add a name or email, it stays in this
        browser. There is no password. You can stop using Linaw at any time.
        Clearing this site’s data in the browser removes the local profile,
        preferences, and saved pieces.
      </Section>
      <Section n="4" title="Your messages">
        You keep the messages you paste, drop, or upload. Linaw may process
        that text only to build the clarified note and its Meaning Check. A
        share link puts the source in the URL on purpose. Anyone who receives
        that link can read the message, the same as if you had forwarded it.
      </Section>
      <Section n="5" title="Contest code">
        AppCon’s published judging guideline says the organizer may use
        submitted source code for marketing and sponsors. That right covers
        the code the team submits. It does not cover a reader’s pasted
        messages.
      </Section>
      <Section n="6" title="Model calls">
        With no model key, clarification stays on the offline sample adapter
        and is not sent to a model. If a key is set, the order is Gemini,
        then an OpenAI-compatible gateway, then the offline adapter. The
        reading screen says so before a model is used. The seeded failure
        example never uses a model. It exists so Meaning Check can show a
        warning.
      </Section>
      <Section n="7" title="Do not misuse the app">
        Do not try to pull API keys, flood POST /api/adapt, or paste someone
        else’s private message unless you have a right to use it. Do not
        treat Linaw as advice you can rely on for a legal, medical, school,
        or employment decision.
      </Section>
      <Section n="8" title="No warranty">
        The app is a free demo. It is provided as it is. Meaning Check can
        miss a change, and a model can be wrong. To the extent Philippine law
        allows, the team is not liable for loss that comes from relying on a
        clarified note. Nothing here limits liability that the law does not
        let us limit.
      </Section>
    </article>
  );
}

function PrivacyPanel() {
  return (
    <article
      id="legal-panel-privacy"
      role="tabpanel"
      aria-labelledby="legal-tab-privacy"
      className="font-ui flex flex-col gap-6 text-sm leading-relaxed text-ink sm:text-base"
    >
      <p>
        The Data Privacy Act of 2012 (Republic Act No. 10173) applies when a
        message contains personal information, such as a name, a schedule, or
        a school detail. This notice says what this build actually does. We
        do not invent an NPC registration number.
      </p>
      <Section n="1" title="On this device">
        Preferences (detail, wording, delivery, and Auto-Clarify or Manual)
        stay in localStorage under linaw.preferences.v1. Listen speed stays
        under linaw.listen.rate. An optional name and email stay under
        linaw.auth.v1. Saved pieces stay under linaw.pieces.v1, up to 20,000
        characters each, and only after you press Save on this device. The
        extension keeps the same preference fields, plus reading display
        choices, in chrome.storage.local. None of that is sold.
      </Section>
      <Section n="2" title="What can leave the device">
        Source text is sent to Gemini or the gateway only when a model key is
        set on the server. With no key, POST /api/adapt runs the offline
        adapter and the text is not sent to a model. A share link leaves the
        device when you send it, because the source is inside the URL. Listen
        uses the browser’s speech engine. Some voices stay on the device, and
        some send the spoken line to the browser vendor. A semantic check
        runs only if NLI_ENDPOINT is set, and then only to that address.
      </Section>
      <Section n="3" title="What we do not collect">
        There is no advertising network. Vercel Web Analytics counts page
        views, and a Clarify click records the detail and wording choices
        only. The pasted message, the clarified note, and the account email
        are not in that count. We do not sell messages. The server does not
        write source text to disk and does not log it.
      </Section>
      <Section n="4" title="How long it stays">
        A successful model answer is kept in server memory, up to 50 notes,
        so the same source, detail, and wording are not sent again. That
        memory is gone when the server process stops. Saved pieces stay in
        the browser until you delete them in My Content or clear site data.
        Sign out removes the optional name and email. Saved pieces stay until
        you remove them.
      </Section>
      <Section n="5" title="The extension">
        The companion reads page text only after you clarify a selection, or
        after you turn Auto-Clarify on. Pending text is cleared when the
        panel takes it. Auto-Clarify is off until you opt in. It never runs
        silently.
      </Section>
      <Section n="6" title="Your choices">
        You can delete a saved piece, sign out, or clear this site’s data in
        the browser. That is how access, correction, and deletion work in
        this build. There is no separate privacy desk.
      </Section>
      <Section n="7" title="Children and contact">
        Linaw is not directed at children. If you find a leak, open an issue
        on the project repository. Do not paste a real personal message into
        a public issue. Use the campus-pilot sample instead.
      </Section>
    </article>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-reading text-lg font-semibold text-ink">
        {n}. {title}
      </h2>
      <p className="m-0">{children}</p>
    </section>
  );
}
