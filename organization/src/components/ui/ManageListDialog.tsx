import { useEffect, useState } from "react";
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
import { Lock, Plus, Trash2, Undo2 } from "lucide-react";

/** A rename, told apart from a delete-and-add, so the caller can follow it. */
export interface ListRename {
  from: string;
  to: string;
}

export interface ManageListResult {
  values: string[];
  renames: ListRename[];
  removed: string[];
}

interface Row {
  /** What the item was called when the dialog opened; null for a new one. */
  original: string | null;
  value: string;
  removed: boolean;
}

interface ManageListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Subjects", "Teachers" — used in the title and the messages. */
  title: string;
  items: string[];
  /**
   * Items that may be renamed but not removed, and why. A teacher still on a
   * batch is one: removing them from the picker would not take them off the
   * batch, so they would be back on the next load.
   */
  locked?: Record<string, string>;
  /** Fewer than this and the save is refused, with the reason shown. */
  minItems?: number;
  /** Shown under the title — what a rename here actually changes. */
  note?: string;
  onSave: (result: ManageListResult) => Promise<void>;
}

const lower = (value: string) => value.trim().toLowerCase();

/**
 * Rename and remove the entries of a picker list.
 *
 * Edits a copy, so Cancel really does discard; and a removal is struck through
 * and undoable until Save, rather than gone on the first tap — this is a
 * phone-sized screen, where the trash icon sits a thumb's width from the input.
 */
export function ManageListDialog({
  open,
  onOpenChange,
  title,
  items,
  locked = {},
  minItems = 0,
  note,
  onSave,
}: ManageListDialogProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [added, setAdded] = useState("");
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Snapshot on open only: re-syncing from `items` mid-edit would undo typing.
  useEffect(() => {
    if (open) {
      setRows(items.map((value) => ({ original: value, value, removed: false })));
      setAdded("");
      setProblem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Looked up case-insensitively: a batch may have the teacher typed as
  // "vikram" while the list says "Vikram", and it is the same lock.
  const lockedByName = new Map(Object.entries(locked).map(([name, reason]) => [lower(name), reason]));
  const lockedReason = (row: Row) => (row.original ? lockedByName.get(lower(row.original)) : undefined);

  const setRow = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addRow = () => {
    const value = added.trim();
    if (!value) return;
    setRows((current) => [...current, { original: null, value, removed: false }]);
    setAdded("");
  };

  const save = async () => {
    const pending = added.trim() ? [...rows, { original: null, value: added.trim(), removed: false }] : rows;
    const kept = pending.filter((row) => !row.removed);

    if (kept.some((row) => !row.value.trim())) {
      setProblem("A name cannot be left blank. Remove it instead.");
      return;
    }
    const names = kept.map((row) => lower(row.value));
    const duplicate = names.find((name, i) => names.indexOf(name) !== i);
    if (duplicate) {
      setProblem(`"${kept.find((r) => lower(r.value) === duplicate)?.value}" is on the list twice.`);
      return;
    }
    if (kept.length < minItems) {
      setProblem(`Keep at least ${minItems} — an assignment needs one to choose.`);
      return;
    }

    setSaving(true);
    setProblem(null);
    try {
      await onSave({
        values: kept.map((row) => row.value.trim()),
        renames: kept
          .filter((row) => row.original && row.original !== row.value.trim())
          .map((row) => ({ from: row.original!, to: row.value.trim() })),
        removed: pending.filter((row) => row.removed && row.original).map((row) => row.original!),
      });
      onOpenChange(false);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage {title.toLowerCase()}</DialogTitle>
          <DialogDescription>{note ?? "Rename or remove an entry. Nothing changes until you save."}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {rows.map((row, index) => {
            const reason = lockedReason(row);
            return (
              <div key={`${row.original ?? "new"}-${index}`} className="flex items-center gap-2">
                <Input
                  aria-label={`${title} ${index + 1}`}
                  value={row.value}
                  disabled={row.removed}
                  className={row.removed ? "line-through opacity-60" : ""}
                  onChange={(e) => setRow(index, { value: e.target.value })}
                />
                {row.removed ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Keep ${row.original ?? row.value}`}
                    onClick={() => setRow(index, { removed: false })}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                ) : reason ? (
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center text-muted-foreground"
                    title={reason}
                    aria-label={`${row.value} cannot be removed: ${reason}`}
                  >
                    <Lock className="h-4 w-4" />
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${row.value}`}
                    onClick={() =>
                      // A row added in this dialog and then removed was never
                      // saved, so it simply goes.
                      row.original === null
                        ? setRows((current) => current.filter((_, i) => i !== index))
                        : setRow(index, { removed: true })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}

          {rows.some((row) => lockedReason(row)) && (
            <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-3 w-3 shrink-0" />
              Locked entries are still on a batch. Rename them here; take them off the batch to remove them.
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder={`New ${title.toLowerCase().replace(/s$/, "")}`}
              value={added}
              onChange={(e) => setAdded(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRow();
                }
              }}
            />
            <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label="Add" onClick={addRow}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {problem && <p className="pt-1 text-sm text-destructive">{problem}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
