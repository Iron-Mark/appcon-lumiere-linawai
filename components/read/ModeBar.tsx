"use client";

import { useId, type ReactElement, type ReactNode } from "react";
import {
  Headphones,
  Info,
  ListTree,
  Settings2,
  Type,
} from "lucide-react";
import type { Detail, Delivery, Wording } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PreferenceHandlers = {
  detail: Detail;
  wording: Wording;
  delivery: Delivery;
  disabled?: boolean;
  onDetail: (value: Detail) => void;
  onWording: (value: Wording) => void;
  onDelivery: (value: Delivery) => void;
};

type ReadingPreferencesDialogProps = PreferenceHandlers & {
  /** Single element used as the dialog trigger (DialogTrigger asChild). */
  trigger: ReactElement;
};

export function ReadingPreferencesDialog({
  detail,
  wording,
  delivery,
  disabled,
  onDetail,
  onWording,
  onDelivery,
  trigger,
}: ReadingPreferencesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-full max-w-[min(27rem,calc(100%-2rem))] gap-6 overflow-x-hidden overflow-y-auto p-5 font-ui sm:max-w-[min(27rem,calc(100%-2rem))]"
        showCloseButton
      >
        <DialogHeader className="gap-1.5 pr-10">
          <DialogTitle className="font-ui text-lg font-semibold tracking-tight text-foreground">
            Reading preferences
          </DialogTitle>
          <DialogDescription className="font-ui text-sm leading-relaxed text-ink-muted">
            Choose how Linaw clarifies what you read in this session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <PreferenceQuestion
            icon={<ListTree aria-hidden className="size-[18px]" strokeWidth={2} />}
            title="Detail level"
            question="How much detail would you like?"
            disabled={disabled}
            value={detail}
            onChange={(value) => onDetail(value as Detail)}
            options={[
              { value: "full", label: "Full (detailed)" },
              { value: "key_points", label: "Key Points" },
            ]}
          />
          <PreferenceQuestion
            icon={<Type aria-hidden className="size-[18px]" strokeWidth={2} />}
            title="Language style"
            question="How would you like the content written?"
            disabled={disabled}
            value={wording}
            onChange={(value) => onWording(value as Wording)}
            options={[
              { value: "original", label: "Original" },
              { value: "plain", label: "Plain Language" },
              { value: "taglish", label: "Taglish" },
            ]}
          />
          <PreferenceQuestion
            icon={
              <Headphones aria-hidden className="size-[18px]" strokeWidth={2} />
            }
            title="Delivery"
            question="How would you like to receive the content?"
            disabled={disabled}
            value={delivery}
            onChange={(value) => onDelivery(value as Delivery)}
            options={[
              { value: "read", label: "Read (text)" },
              { value: "listen", label: "Listen (audio)" },
            ]}
          />
        </div>

        <p className="font-ui m-0 flex gap-2 text-sm leading-relaxed text-ink-subtle">
          <Info
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-ink-subtle"
            strokeWidth={2}
          />
          <span>
            These preferences apply as you choose them. You can also change them
            anytime in Settings.
          </span>
        </p>

        <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0 sm:justify-stretch">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              className="min-h-11 w-full cursor-pointer font-ui text-[0.9375rem] font-semibold sm:w-full"
            >
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ModeBarProps = PreferenceHandlers;

const PREFERENCE_SUMMARY: {
  detail: Record<Detail, string>;
  wording: Record<Wording, string>;
  delivery: Record<Delivery, string>;
} = {
  detail: { full: "Full", key_points: "Key Points" },
  wording: { original: "Original", plain: "Plain Language", taglish: "Taglish" },
  delivery: { read: "Read", listen: "Listen" },
};

export function ModeBar({
  detail,
  wording,
  delivery,
  disabled,
  onDetail,
  onWording,
  onDelivery,
}: ModeBarProps) {
  const summary = [
    PREFERENCE_SUMMARY.detail[detail],
    PREFERENCE_SUMMARY.wording[wording],
    PREFERENCE_SUMMARY.delivery[delivery],
  ];

  return (
    <ReadingPreferencesDialog
      detail={detail}
      wording={wording}
      delivery={delivery}
      disabled={disabled}
      onDetail={onDetail}
      onWording={onWording}
      onDelivery={onDelivery}
      trigger={
        <Button
          type="button"
          variant="outline"
          aria-label={`Reading as ${summary.join(", ")}. Change preferences.`}
          className="h-11 min-h-11 w-fit max-w-full cursor-pointer gap-1.5 rounded-full px-3.5 font-ui text-[0.875rem] font-medium text-ink hover:bg-paper-inset hover:text-ink"
        >
          {summary.map((label, index) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              {index > 0 ? (
                <span aria-hidden className="text-ink-subtle">
                  ·
                </span>
              ) : null}
              <span>{label}</span>
            </span>
          ))}
          <Settings2
            aria-hidden
            className="size-4 shrink-0 text-ink-muted"
            strokeWidth={2}
          />
        </Button>
      }
    />
  );
}

function PreferenceQuestion({
  icon,
  title,
  question,
  options,
  value,
  onChange,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  question: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const titleId = useId();
  const questionId = useId();

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-describedby={questionId}
      className="flex flex-col gap-3"
    >
      <div className="flex gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-action-soft text-action"
        >
          {icon}
        </span>
        <div className="min-w-0 flex flex-col gap-0.5">
          <span
            id={titleId}
            className="font-ui text-[0.9375rem] font-semibold tracking-tight text-ink"
          >
            {title}
          </span>
          <span
            id={questionId}
            className="font-ui text-sm leading-snug text-ink-muted"
          >
            {question}
          </span>
        </div>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        variant="outline"
        spacing={2}
        disabled={disabled}
        className="flex w-full max-w-full flex-wrap justify-start"
        aria-labelledby={titleId}
        aria-describedby={questionId}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className="min-h-11 min-w-11 flex-1 cursor-pointer basis-[calc(50%-0.25rem)] px-2.5 font-ui text-sm data-[state=on]:border-action-border data-[state=on]:bg-action-soft data-[state=on]:font-semibold data-[state=on]:text-ink"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
