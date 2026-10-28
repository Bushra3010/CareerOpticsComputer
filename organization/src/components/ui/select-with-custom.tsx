import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOM_CHOICE, type ChoiceOption, normaliseChoices } from "@/lib/choices";

/**
 * A dropdown whose last entry is "Other (type your own)…".
 *
 * Every list of choices in this app ended in a bare "Other", which records that
 * something was none of the above without recording what it was -- an institute
 * that is neither computer nor typing, a guardian who is a neighbour. Choosing
 * the last entry here opens a box and the typed words become the value.
 *
 * Works controlled (`value` + `onValueChange`) or, for the uncontrolled branch
 * forms that read themselves with `FormData`, by `name` alone: the resolved
 * value is carried by a hidden input, so one key is submitted either way.
 */
export interface SelectWithCustomProps {
  options: Array<ChoiceOption | string>;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Submits the resolved value under this key in an uncontrolled form. */
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  customLabel?: string;
  customPlaceholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectWithCustom({
  options,
  value,
  onValueChange,
  name,
  defaultValue = "",
  placeholder = "Select",
  customLabel = "Other (type your own)…",
  customPlaceholder = "Type it in",
  id,
  disabled,
  className,
}: SelectWithCustomProps) {
  const list = normaliseChoices(options);
  const controlled = value !== undefined;
  const [own, setOwn] = useState(defaultValue);
  const current = controlled ? value : own;
  const known = list.some((option) => option.value === current);

  /** Typing mode is its own state: the box has to stay open while it is empty,
   *  and an empty value is indistinguishable from nothing chosen. */
  const [typing, setTyping] = useState(() => Boolean(current) && !known);
  const boxRef = useRef<HTMLInputElement>(null);
  /** Radix hands focus back to the trigger when the list closes, so `autoFocus`
   *  on the box is undone before anything can be typed into it. */
  const wantsBox = useRef(false);
  // A saved custom value arriving later -- an edit dialog opening on a record
  // -- opens the box on its own, rather than showing an empty dropdown.
  const seen = useRef(current);
  useEffect(() => {
    if (current === seen.current) return;
    seen.current = current;
    if (current && !list.some((option) => option.value === current)) setTyping(true);
  }, [current, list]);

  const set = (next: string) => {
    if (!controlled) setOwn(next);
    onValueChange?.(next);
  };

  return (
    <div className={className}>
      <Select
        value={typing ? CUSTOM_CHOICE : known ? current : ""}
        disabled={disabled}
        onValueChange={(next) => {
          if (next === CUSTOM_CHOICE) {
            setTyping(true);
            wantsBox.current = true;
            set("");
            return;
          }
          setTyping(false);
          set(next);
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          onCloseAutoFocus={(event) => {
            if (!wantsBox.current) return;
            wantsBox.current = false;
            event.preventDefault();
            requestAnimationFrame(() => boxRef.current?.focus());
          }}
        >
          {list.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_CHOICE}>{customLabel}</SelectItem>
        </SelectContent>
      </Select>
      {typing && (
        <Input
          ref={boxRef}
          className="mt-2"
          aria-label={customPlaceholder}
          placeholder={customPlaceholder}
          value={current}
          onChange={(e) => set(e.target.value)}
        />
      )}
      {/* Radix's own hidden field is not used: in typing mode the value comes
          from the box, not the dropdown. */}
      {name && <input type="hidden" name={name} value={current} />}
    </div>
  );
}
