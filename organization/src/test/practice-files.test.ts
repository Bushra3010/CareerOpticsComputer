import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Where Code Lab programs and Whiteboard boards are kept: `practice_files`
 * when it exists, the browser until then — and moved up once it does.
 */
let tableExists = false;
const inserted: Array<Record<string, unknown>> = [];
/** Ids the fake table already holds, to test a move retried halfway. */
const alreadyThere = new Set<string>();
let rows: Array<Record<string, unknown>> = [];

vi.mock("@/lib/supabase/client", () => {
  const missing = { code: "PGRST205", message: "Could not find the table 'public.practice_files'" };
  const builder = () => {
    let op: "select" | "insert" | "update" = "select";
    let body: Record<string, unknown> = {};
    const result = () => {
      if (!tableExists) return { data: null, error: missing };
      if (op === "insert") {
        if (body.id && alreadyThere.has(String(body.id))) {
          return { data: null, error: { code: "23505", message: "duplicate key" } };
        }
        const row = { id: body.id ?? "db-1", ...body };
        inserted.push(row);
        return { data: row, error: null };
      }
      if (op === "update") return { data: { id: "db-1", ...body }, error: null };
      return { data: rows, error: null };
    };
    const chain: Record<string, unknown> = {
      select: () => chain,
      insert: (b: Record<string, unknown>) => ((op = "insert"), (body = b), chain),
      update: (b: Record<string, unknown>) => ((op = "update"), (body = b), chain),
      eq: () => chain,
      is: () => chain,
      order: () => chain,
      limit: () => chain,
      single: () => Promise.resolve(result()),
      then: (resolve: (v: unknown) => unknown) => resolve(result()),
    };
    return chain;
  };
  return { supabase: { from: builder }, supabaseUrl: "https://x.supabase.co" };
});

const { listPracticeFiles, savePracticeFile, deletePracticeFile } = await import("@/lib/practiceFiles");

const aman = { ownerId: "aman" };
const riya = { ownerId: "riya" };
const program = { kind: "code" as const, title: "Loops", language: "python", content: "{}" };

beforeEach(() => {
  tableExists = false;
  inserted.length = 0;
  alreadyThere.clear();
  rows = [];
  localStorage.clear();
});

describe("before the table exists", () => {
  it("keeps a file in the browser, and says so", async () => {
    const saved = await savePracticeFile(aman, program);
    expect(saved.stored).toBe(false);

    const listed = await listPracticeFiles(aman, "code");
    expect(listed.stored).toBe(false);
    expect(listed.data.map((f) => f.title)).toEqual(["Loops"]);
  });

  // A lab machine is shared by a whole batch.
  it("never shows one student's files to the next one on the same computer", async () => {
    await savePracticeFile(aman, program);

    expect((await listPracticeFiles(riya, "code")).data).toEqual([]);
  });

  it("keeps programs and boards apart", async () => {
    await savePracticeFile(aman, program);
    expect((await listPracticeFiles(aman, "board")).data).toEqual([]);
  });

  it("updates a file in place rather than adding a second copy", async () => {
    const first = await savePracticeFile(aman, program);
    await savePracticeFile(aman, { ...program, id: first.data.id, title: "Loops v2" });

    const listed = await listPracticeFiles(aman, "code");
    expect(listed.data).toHaveLength(1);
    expect(listed.data[0].title).toBe("Loops v2");
  });

  it("names an untitled file rather than saving a blank title", async () => {
    const saved = await savePracticeFile(aman, { ...program, title: "   " });
    expect(saved.data.title).toBe("Untitled");
  });

  it("deletes from the browser", async () => {
    const saved = await savePracticeFile(aman, program);
    await deletePracticeFile(aman, saved.data.id);
    expect((await listPracticeFiles(aman, "code")).data).toEqual([]);
  });
});

describe("once the table exists", () => {
  it("moves files made in the browser up into it, under their own ids", async () => {
    const local = await savePracticeFile(aman, program);
    tableExists = true;

    const listed = await listPracticeFiles(aman, "code");

    expect(listed.stored).toBe(true);
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ id: local.data.id, ownerId: "aman", title: "Loops" });
    // And out of the browser once they are up.
    expect(localStorage.getItem("practice-files:aman")).toBeNull();
  });

  // A move cut off halfway and tried again must not file anything twice.
  it("drops a file already moved on an earlier try, rather than filing it twice", async () => {
    const local = await savePracticeFile(aman, program);
    tableExists = true;
    alreadyThere.add(local.data.id);

    await listPracticeFiles(aman, "code");

    expect(inserted).toEqual([]);
    expect(localStorage.getItem("practice-files:aman")).toBeNull();
  });

  it("moves only the signed-in user's files", async () => {
    await savePracticeFile(aman, program);
    await savePracticeFile(riya, { ...program, title: "Riya's" });
    tableExists = true;

    await listPracticeFiles(aman, "code");

    expect(inserted.map((r) => r.ownerId)).toEqual(["aman"]);
    expect(localStorage.getItem("practice-files:riya")).not.toBeNull();
  });

  it("saves to the account and reports it", async () => {
    tableExists = true;
    const saved = await savePracticeFile(aman, program);
    expect(saved.stored).toBe(true);
    expect(inserted[0]).toMatchObject({ ownerId: "aman", kind: "code", language: "python" });
  });
});
