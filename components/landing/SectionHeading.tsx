import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
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
      <p className="font-ui text-sm font-semibold text-action">{eyebrow}</p>
      <h2
        id={id}
        className="font-ui text-3xl font-semibold tracking-tight text-balance text-ink md:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="font-ui text-lg leading-relaxed text-pretty text-ink-muted">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
