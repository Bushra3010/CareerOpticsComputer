import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * A course's website photo, switch and page live in columns that
 * website-courses.sql adds. Until it is run, saving a course must still
 * work -- without those three -- and say so, rather than refuse the course.
 */
let hasWebsiteColumns = true;
const writes: Array<Record<string, unknown>> = [];

const reply = (payload: Record<string, unknown>) => {
  writes.push(payload);
  const missing = ["image", "showOnWebsite", "websitePage"].find((c) => c in payload);
  if (!hasWebsiteColumns && missing) {
    return { data: null, error: { code: "PGRST204", message: `Could not find the '${missing}' column of 'courses' in the schema cache` } };
  }
  return { data: { id: "c1", durationValue: 6, durationUnit: "MONTHS", ...payload }, error: null };
};

const builder = () => {
  let payload: Record<string, unknown> = {};
  const chain: Record<string, unknown> = {
    insert: (p: Record<string, unknown>) => ((payload = p), chain),
    update: (p: Record<string, unknown>) => ((payload = p), chain),
    eq: () => chain,
    select: () => chain,
    single: () => Promise.resolve(reply(payload)),
  };
  return chain;
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: () => builder() },
  supabaseUrl: "https://project.supabase.co",
}));

const { createCourse, updateCourse } = await import("@/lib/supabase/data");

const input = {
  name: "DCA",
  code: "DCA",
  category: "COMPUTER",
  durationMonths: 6,
  baseFee: 3499,
  isActive: true,
  image: "https://x.supabase.co/storage/v1/object/public/website/courses/a.webp",
  showOnWebsite: true,
  websitePage: "ms-office.html",
};

beforeEach(() => {
  writes.length = 0;
  hasWebsiteColumns = true;
});

describe("saving a course with its website details", () => {
  it("saves them when the database has the columns", async () => {
    const result = await createCourse("org1", input);
    expect(result.droppedColumns).toEqual([]);
    expect(result.data).toMatchObject({ image: input.image, websitePage: "ms-office.html" });
    expect(writes).toHaveLength(1);
  });

  it("still saves the course before website-courses.sql, and names what it left out", async () => {
    hasWebsiteColumns = false;
    const result = await createCourse("org1", input);
    expect(result.success).toBe(true);
    expect(result.droppedColumns).toEqual(["image", "showOnWebsite", "websitePage"]);
    expect(writes[1]).not.toHaveProperty("image");
    expect(writes[1]).toMatchObject({ name: "DCA", baseFee: 3499 });
  });

  it("does the same on an edit", async () => {
    hasWebsiteColumns = false;
    const result = await updateCourse("c1", { ...input, isActive: true });
    expect(result.droppedColumns).toEqual(["image", "showOnWebsite", "websitePage"]);
  });
});
