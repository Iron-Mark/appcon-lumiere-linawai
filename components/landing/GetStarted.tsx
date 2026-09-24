"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CompanionPanel,
  DevSwitch,
  OpenFolder,
  WebWindow,
  ZipFile,
} from "@/components/illustrations";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const STEPS = [
  {
    id: "1",
    sentence: "Save the ZIP, then unzip it.",
    action: "Download",
  },
  {
    id: "2",
    sentence: "Turn on Developer mode.",
    action: "Copy extensions link",
  },
  {
    id: "3",
    sentence: "Unzip, then pick that folder.",
    action: "Done",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function GetStarted() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<StepId>("1");
  const [copied, setCopied] = useState(false);
  const current = STEPS.find((item) => item.id === step) ?? STEPS[0];

  function go(next: string) {
    if (next === "1" || next === "2" || next === "3") setStep(next);
  }

  function downloadZip() {
    const link = document.createElement("a");
    link.href = "/linaw-chrome-extension.zip";
    link.download = "linaw-chrome-extension.zip";
    link.click();
    setStep("2");
  }

  async function copyExtensions() {
    try {
      await navigator.clipboard.writeText("chrome://extensions");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id="get-started"
      aria-labelledby="start-title"
      className="landing-section landing-section--inset-soft"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="start-title"
          eyebrow="Get started"
          title="Web app first. Chrome companion when you need it."
          description="Same preferences either way. The web app is the main product; the companion is a thin add-on."
          align="center"
        />

        <div className="font-ui mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border">
          <Reveal delay={60} className="flex flex-col md:pr-10">
            <WebWindow className="h-20 w-32" />
            <h3 className="font-reading mt-5 text-xl font-semibold text-ink">
              Web app
            </h3>
            <p className="mt-2 leading-relaxed text-pretty text-ink-muted">
              Set detail, wording, delivery, and browser behavior, then read in
              the workspace. Nothing to install.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/read"
                className="inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-base font-semibold text-ink transition-colors hover:bg-action-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Peek at the reading workspace
              </Link>
            </div>
          </Reveal>

          <Reveal className="flex flex-col md:pl-10">
            <CompanionPanel className="h-20 w-32" />
            <h3 className="font-reading mt-5 text-xl font-semibold text-ink">
              Chrome companion
            </h3>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button className="mt-6 h-11 min-h-11 w-fit px-4 text-base">
                  Load companion
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-paper text-ink">
                <SheetHeader>
                  <SheetTitle className="font-reading text-ink">
                    Load companion
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Three steps to load the Linaw extension in Chrome.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4">
                  <ToggleGroup
                    type="single"
                    value={step}
                    onValueChange={go}
                    aria-label="Load step"
                    className="justify-start"
                  >
                    {STEPS.map((item) => (
                      <ToggleGroupItem
                        key={item.id}
                        value={item.id}
                        aria-current={item.id === step ? "step" : undefined}
                        className="min-h-11 min-w-11"
                      >
                        {item.id}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <StepArt step={step} />
                  <Separator />
                  <p className="text-sm text-ink-muted">{current.sentence}</p>
                  {step === "1" ? (
                    <Button className="h-11 min-h-11" onClick={downloadZip}>
                      {current.action}
                    </Button>
                  ) : null}
                  {step === "2" ? (
                    <Button className="h-11 min-h-11" onClick={() => void copyExtensions()}>
                      {copied ? "Copied" : current.action}
                    </Button>
                  ) : null}
                  {step === "3" ? (
                    <Button className="h-11 min-h-11" onClick={() => setOpen(false)}>
                      {current.action}
                    </Button>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StepArt({ step }: { step: StepId }) {
  return (
    <div className="grid h-40" aria-hidden="true">
      <ZipArt show={step === "1"} />
      <DevModeArt show={step === "2"} />
      <FolderArt show={step === "3"} />
    </div>
  );
}

function frame(show: boolean) {
  return `col-start-1 row-start-1 h-40 w-full transition-opacity duration-200 motion-reduce:transition-none ${
    show ? "opacity-100" : "opacity-0"
  }`;
}

function ZipArt({ show }: { show: boolean }) {
  return <ZipFile className={frame(show)} />;
}

function DevModeArt({ show }: { show: boolean }) {
  return <DevSwitch className={frame(show)} />;
}

function FolderArt({ show }: { show: boolean }) {
  return <OpenFolder className={frame(show)} />;
}
