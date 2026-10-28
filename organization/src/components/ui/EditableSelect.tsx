/**
 * A picker whose own option list can be edited in place.
 *
 * Every taxonomy dropdown in the app (gender, blood group, board, stream,
 * course category, ...) was a hard-coded array, so anything the code had not
 * anticipated simply could not be recorded. The pencil next to the trigger
 * opens a dialog to add, rename and remove entries; the list is shared across
 * the organisation via `useDropdownOptions`.
 */
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DROPDOWN_TITLES,
  optionLabel,
  useDropdownOptions,
  type DropdownKey,
} from "@/lib/dropdownOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EditableSelectProps {
  /** Which shared list this picker draws from. */
  optionKey: DropdownKey;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Hide the pencil where the list is not the current user's to change. */
  editable?: boolean;
  /**
   * Values already in use on existing records. Offered alongside the saved list
   * so a category typed last month comes back as a normal option rather than
   * having to be retyped from memory.
   */
  extraOptions?: string[];
}

export function EditableSelect({
  optionKey,
  value,
  onChange,
  placeholder = "Select",
  disabled,
  id,
  editable = true,
  extraOptions,
}: EditableSelectProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { options, save } = useDropdownOptions(user?.organizationId);
  const list = useMemo(
    () => [...new Set([...options(optionKey), ...(extraOptions ?? []), value].filter(Boolean))],
    [options, optionKey, extraOptions, value],
  );

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(list);
  const [added, setAdded] = useState("");
  const [saving, setSaving] = useState(false);

  // The dialog edits a copy, so Cancel really does discard. Snapshotting only on
  // open is the point: re-syncing from `list` mid-edit would undo every keystroke.
  useEffect(() => {
    if (open) {
      setDraft(list);
      setAdded("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const commit = async () => {
    const cleaned = [...new Set([...draft, added].map((v) => v.trim()).filter(Boolean))];
    if (!cleaned.length) {
      toast({ title: "Keep at least one option", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { stored } = await save(optionKey, cleaned);
    setSaving(false);
    setOpen(false);
    // A value that was just renamed away would otherwise sit in the trigger as
    // a selection no longer on the list.
    if (value && !cleaned.includes(value)) onChange("");
    toast({
      title: `${DROPDOWN_TITLES[optionKey]} list updated`,
      description: stored
        ? "Everyone in the organisation sees these options."
        : "Saved in this browser only — run add-multi-course-and-dropdowns.sql to share it.",
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Radix rejects "" as an item value, so a blank never becomes a row. */}
          {list
            .filter(Boolean)
            .map((option) => (
              <SelectItem key={option} value={option}>
                {optionLabel(option)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {editable && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          aria-label={`Manage ${DROPDOWN_TITLES[optionKey].toLowerCase()} options`}
          title={`Manage ${DROPDOWN_TITLES[optionKey].toLowerCase()} options`}
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {DROPDOWN_TITLES[optionKey].toLowerCase()} options</DialogTitle>
            <DialogDescription>
              Rename an entry by typing over it. Removing one leaves records that
              already use it untouched.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {draft.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  aria-label={`Option ${index + 1}`}
                  onChange={(event) =>
                    setDraft((list) => list.map((v, i) => (i === index ? event.target.value : v)))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  aria-label={`Remove ${option}`}
                  onClick={() => setDraft((list) => list.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {draft.length === 0 && (
              <p className="text-sm text-muted-foreground">No options left — add one below.</p>
            )}
          </div>

          <div className="flex items-center gap-2 border-t pt-4">
            <Input
              value={added}
              placeholder="Add an option"
              aria-label="Add an option"
              onChange={(event) => setAdded(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || !added.trim()) return;
                event.preventDefault();
                setDraft((list) => [...list, added.trim()]);
                setAdded("");
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              disabled={!added.trim()}
              onClick={() => {
                setDraft((list) => [...list, added.trim()]);
                setAdded("");
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={commit} disabled={saving}>
              {saving ? "Saving…" : "Save options"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
