/**
 * A checkbox list in a popover, for fields that legitimately hold more than one
 * value - a student enrolled on three courses, for instance.
 *
 * `Select all` and `Clear` act on whatever the search box currently shows, so
 * "select all" of a filtered list means exactly that.
 */
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /**
   * The field's name for assistive tech. A `combobox` takes no name from its own
   * text, so without this the trigger announces as "2 selected" and nothing else.
   */
  label?: string;
  /** Shown under the list, e.g. to explain which one counts as primary. */
  hint?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select",
  disabled,
  id,
  label,
  hint,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  const selected = new Set(value);
  const allVisibleSelected = visible.length > 0 && visible.every((o) => selected.has(o.value));

  const toggle = (option: string) => {
    onChange(selected.has(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  const toggleAllVisible = () => {
    const ids = visible.map((o) => o.value);
    if (allVisibleSelected) {
      onChange(value.filter((v) => !ids.includes(v)));
      return;
    }
    onChange([...new Set([...value, ...ids])]);
  };

  const labelFor = (option: string) =>
    options.find((o) => o.value === option)?.label ?? option;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={value.length ? "" : "text-muted-foreground"}>
              {value.length === 0
                ? placeholder
                : value.length === 1
                  ? labelFor(value[0])
                  : `${value.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="border-b p-2">
            <Input
              value={query}
              placeholder="Search…"
              aria-label="Search options"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between border-b px-2 py-1.5 text-xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={visible.length === 0}
              onClick={toggleAllVisible}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              {allVisibleSelected ? "Unselect all" : "Select all"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={value.length === 0}
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {visible.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">Nothing matches “{query}”.</p>
            ) : (
              visible.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={selected.has(option.value)}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  <span className="flex-1">{option.label}</span>
                </label>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((option) => (
            <Badge key={option} variant="secondary" className="gap-1 font-normal">
              {labelFor(option)}
              <button
                type="button"
                aria-label={`Remove ${labelFor(option)}`}
                onClick={() => toggle(option)}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
