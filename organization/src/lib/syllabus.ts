/**
 * Reading a course's syllabus.
 *
 * Modules are the sections of a course and chapters are what is taught inside
 * one, so the screen always wants them nested and in teaching order — never as
 * the two flat lists the database hands back.
 */
import type { SyllabusChapter, SyllabusModule } from "@/lib/supabase/data";

export interface SyllabusSection {
  module: SyllabusModule;
  chapters: SyllabusChapter[];
}

/** Order written, then name: two sections given the same number still sort. */
const byOrder = <T extends { sortOrder: number; name: string }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);

export function buildSyllabus(
  modules: SyllabusModule[],
  chapters: SyllabusChapter[],
): SyllabusSection[] {
  const byModule = new Map<string, SyllabusChapter[]>();
  for (const chapter of chapters) {
    const list = byModule.get(chapter.moduleId);
    if (list) list.push(chapter);
    else byModule.set(chapter.moduleId, [chapter]);
  }
  return [...modules].sort(byOrder).map((module) => ({
    module,
    chapters: (byModule.get(module.id) ?? []).slice().sort(byOrder),
  }));
}

/**
 * Narrow a syllabus by a search and a status.
 *
 * A module whose own name matches is kept whole, because searching for a
 * section means wanting to see what is in it. A module kept only for its
 * chapters shows just the chapters that matched.
 */
export function filterSyllabus(
  sections: SyllabusSection[],
  options: { search?: string; status?: "All" | "Active" | "Inactive" } = {},
): SyllabusSection[] {
  const q = (options.search ?? "").trim().toLowerCase();
  const status = options.status ?? "All";

  return sections
    .map((section) => {
      const moduleMatches =
        !q ||
        `${section.module.name} ${section.module.description}`.toLowerCase().includes(q);

      const chapters = section.chapters.filter((chapter) => {
        if (status !== "All" && chapter.status !== status) return false;
        if (!q || moduleMatches) return true;
        return `${chapter.name} ${chapter.description} ${chapter.practical}`
          .toLowerCase()
          .includes(q);
      });

      return { section, chapters, moduleMatches };
    })
    .filter(({ chapters, moduleMatches, section }) => {
      if (status !== "All" && section.module.status !== status && !chapters.length) return false;
      return moduleMatches || chapters.length > 0;
    })
    .map(({ section, chapters }) => ({ module: section.module, chapters }));
}

/** The next number to put on a new module or chapter in a list. */
export const nextOrder = (items: Array<{ sortOrder: number }>) =>
  items.reduce((highest, item) => Math.max(highest, item.sortOrder), 0) + 1;

/**
 * A chapter can carry several PDF notes and several videos. They are kept one
 * per line in the same column a single link always lived in, so a chapter
 * saved with one link reads back as a list of one.
 */
export const splitLinks = (value: string | null | undefined): string[] =>
  String(value ?? "")
    .split(/\s+/)
    .map((v) => v.trim())
    .filter(Boolean);

/** The links as the column stores them: one per line, blanks dropped. */
export const joinLinks = (links: string[]) => links.map((l) => l.trim()).filter(Boolean).join("\n");

/** Only the links that are real web addresses, ready to put in an href. */
export const safeLinks = (value: string | null | undefined): string[] =>
  splitLinks(value).map(safeUrl).filter((url): url is string => url !== null);

/** The first typed link that is not a web address, by its place in the list, or null. */
export function badLink(links: string[]): number | null {
  const typed = links.map((l) => l.trim());
  const index = typed.findIndex((l) => l && !safeUrl(l));
  return index < 0 ? null : index;
}

/** How much of the syllabus carries notes or a video. */
export const studyLinkCount = (chapters: SyllabusChapter[]) =>
  chapters.filter((chapter) => safeLinks(chapter.pdfUrl).length || safeLinks(chapter.videoUrl).length).length;

/** Why a module or chapter cannot be saved, or null when it can. */
export function syllabusProblem(draft: { name: string; sortOrder: number }): string | null {
  if (!draft.name.trim()) return "Give it a name.";
  if (!Number.isFinite(draft.sortOrder) || draft.sortOrder < 1) {
    return "The order has to be 1 or more.";
  }
  return null;
}

/**
 * A link is only offered when it is one.
 *
 * A half-typed address renders as a link that navigates nowhere, and a
 * `javascript:` one is worse than useless on a page that prints what a branch
 * typed in.
 */
export function safeUrl(value: string): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
