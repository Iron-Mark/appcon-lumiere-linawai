import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <p className="font-ui m-0 text-xs font-semibold tracking-[0.08em] text-action uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="font-reading m-0 text-3xl font-semibold tracking-[-0.02em] text-balance text-ink md:text-[2.25rem] md:leading-tight"
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "font-ui m-0 text-base leading-relaxed text-pretty text-ink-muted md:text-lg",
            align === "center" && "max-w-xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
