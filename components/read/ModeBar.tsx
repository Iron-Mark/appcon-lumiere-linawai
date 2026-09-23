"use client";

import { useId } from "react";
import { Settings2 } from "lucide-react";
import type { Detail, Delivery, Wording } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ModeBarProps = {
  detail: Detail;
  wording: Wording;
  delivery: Delivery;
  disabled?: boolean;
  onDetail: (value: Detail) => void;
  onWording: (value: Wording) => void;
  onDelivery: (value: Delivery) => void;
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 gap-2 px-4 font-ui text-[0.9375rem] font-semibold"
        >
          <Settings2 aria-hidden className="size-[18px]" strokeWidth={2} />
          Preferences
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-full max-w-[min(22rem,calc(100%-2rem))] gap-5 overflow-x-hidden overflow-y-auto p-5 font-ui sm:max-w-[min(22rem,calc(100%-2rem))]"
        showCloseButton
      >
        <DialogHeader className="pr-10">
          <DialogTitle className="font-ui text-lg font-semibold tracking-tight text-foreground">
            Reading preferences
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <PreferenceToggle
            label="Detail"
            disabled={disabled}
            value={detail}
            onChange={(value) => onDetail(value as Detail)}
            options={[
              { value: "full", label: "Full" },
              { value: "key_points", label: "Key Points" },
            ]}
          />
          <PreferenceToggle
            label="Wording"
            disabled={disabled}
            value={wording}
            onChange={(value) => onWording(value as Wording)}
            options={[
              { value: "original", label: "Original" },
              { value: "plain", label: "Plain Language" },
            ]}
          />
          <PreferenceToggle
            label="Delivery"
            disabled={disabled}
            value={delivery}
            onChange={(value) => onDelivery(value as Delivery)}
            options={[
              { value: "read", label: "Read" },
              { value: "listen", label: "Listen" },
            ]}
          />
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0 sm:justify-stretch">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              className="min-h-11 w-full font-ui text-[0.9375rem] font-semibold sm:w-full"
            >
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreferenceToggle({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex flex-col gap-2"
    >
      <span
        id={labelId}
        className="font-ui text-xs font-semibold tracking-[0.04em] text-ink-subtle uppercase"
      >
        {label}
      </span>
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
        aria-labelledby={labelId}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className="min-h-11 min-w-11 flex-1 basis-[calc(50%-0.25rem)] px-3 font-ui text-sm data-[state=on]:border-action-border data-[state=on]:bg-action-soft data-[state=on]:text-ink data-[state=on]:font-semibold"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
