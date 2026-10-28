/**
 * What a student or teacher makes in the Code Lab and on the Whiteboard.
 *
 * Kept in `practice_files` (practice-files.sql), which is private to its
 * owner. Until that table exists the files stay in the browser they were made
 * in — and once it does, anything left there is moved up the first time the
 * list is read, so nothing typed before the migration is lost.
 */
import { supabase } from "@/lib/supabase/client";
import { newId } from "@/lib/id";

export type PracticeKind = "code" | "board";

export interface PracticeFile {
  id: string;
  kind: PracticeKind;
  title: string;
  /** The Code Lab language ("web", "python", …); empty on a board. */
  language: string;
  content: string;
  updatedAt: string;
}

export interface PracticeOwner {
  ownerId: string;
  organizationId?: string | null;
  branchId?: string | null;
}

const isMissingTable = (error: { code?: string; message?: string } | null) => {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const message = error.message ?? "";
  return /practice_files/.test(message) && /does not exist|schema cache/.test(message);
};

/* ---------- the in-browser fallback ---------- */

/*
 * Keyed by owner. A lab machine is shared by a whole batch, and one key for
 * the browser would show every student's files to whoever logs in next.
 */
const localKey = (ownerId: string) => `practice-files:${ownerId}`;

function readLocal(ownerId: string): PracticeFile[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(localKey(ownerId)) || "[]");
    return Array.isArray(parsed) ? (parsed as PracticeFile[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ownerId: string, files: PracticeFile[]) {
  try {
    if (files.length) localStorage.setItem(localKey(ownerId), JSON.stringify(files));
    else localStorage.removeItem(localKey(ownerId));
  } catch {
    // A full store fails the save, which the caller reports; the files already
    // held are untouched.
    throw new Error("This browser's storage is full, so the file could not be kept.");
  }
}

const toFile = (row: Record<string, unknown>): PracticeFile => ({
  id: String(row.id),
  kind: (row.kind === "board" ? "board" : "code") as PracticeKind,
  title: String(row.title ?? "") || "Untitled",
  language: String(row.language ?? ""),
  content: String(row.content ?? ""),
  updatedAt: String(row.updatedAt ?? ""),
});

const newestFirst = (a: PracticeFile, b: PracticeFile) => b.updatedAt.localeCompare(a.updatedAt);

/**
 * Move files made before the table existed up into it.
 *
 * Each goes up under its own id, so a move interrupted halfway and tried again
 * finds the ones already there by their primary key and simply drops them from
 * the browser, rather than filing them twice.
 */
async function moveLocalUp(owner: PracticeOwner) {
  const local = readLocal(owner.ownerId);
  if (!local.length) return;
  const left: PracticeFile[] = [];
  for (const file of local) {
    const { error } = await supabase.from("practice_files").insert({
      id: file.id,
      ownerId: owner.ownerId,
      organizationId: owner.organizationId ?? null,
      branchId: owner.branchId ?? null,
      kind: file.kind,
      title: file.title,
      language: file.language || null,
      content: file.content,
      updatedAt: file.updatedAt || new Date().toISOString(),
    });
    // 23505: already moved on an earlier try.
    if (error && error.code !== "23505") left.push(file);
  }
  writeLocal(owner.ownerId, left);
}

/** `stored` is false while the files live only in this browser. */
export async function listPracticeFiles(owner: PracticeOwner, kind: PracticeKind) {
  const { error: probe } = await supabase.from("practice_files").select("id").limit(1);
  if (isMissingTable(probe)) {
    return {
      data: readLocal(owner.ownerId).filter((f) => f.kind === kind).sort(newestFirst),
      stored: false,
    };
  }
  if (probe) throw new Error(probe.message);

  await moveLocalUp(owner);

  const { data, error } = await supabase
    .from("practice_files")
    .select("*")
    .eq("ownerId", owner.ownerId)
    .eq("kind", kind)
    .is("deletedAt", null)
    .order("updatedAt", { ascending: false });
  if (error) throw new Error(error.message);
  return { data: (data ?? []).map((row) => toFile(row as Record<string, unknown>)), stored: true };
}

/** Creates the file when it has no id yet, and updates it when it has one. */
export async function savePracticeFile(
  owner: PracticeOwner,
  file: Omit<PracticeFile, "id" | "updatedAt"> & { id?: string },
) {
  const now = new Date().toISOString();
  const body = {
    ownerId: owner.ownerId,
    organizationId: owner.organizationId ?? null,
    branchId: owner.branchId ?? null,
    kind: file.kind,
    title: file.title.trim() || "Untitled",
    language: file.language || null,
    content: file.content,
    updatedAt: now,
  };

  const { data, error } = file.id
    ? await supabase.from("practice_files").update(body).eq("id", file.id).select("*").single()
    : await supabase.from("practice_files").insert(body).select("*").single();

  if (isMissingTable(error)) {
    const saved: PracticeFile = {
      id: file.id ?? newId("pf"),
      kind: file.kind,
      title: body.title,
      language: file.language,
      content: file.content,
      updatedAt: now,
    };
    const others = readLocal(owner.ownerId).filter((f) => f.id !== saved.id);
    writeLocal(owner.ownerId, [saved, ...others]);
    return { data: saved, stored: false };
  }
  if (error) throw new Error(error.message);
  return { data: toFile(data as Record<string, unknown>), stored: true };
}

/** Soft-deleted in the table, so a slip can be undone from the database. */
export async function deletePracticeFile(owner: PracticeOwner, id: string) {
  const { error } = await supabase
    .from("practice_files")
    .update({ deletedAt: new Date().toISOString() })
    .eq("id", id);
  if (isMissingTable(error)) {
    writeLocal(owner.ownerId, readLocal(owner.ownerId).filter((f) => f.id !== id));
    return { stored: false };
  }
  if (error) throw new Error(error.message);
  return { stored: true };
}
