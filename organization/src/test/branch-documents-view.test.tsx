import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A centre's registration documents: shown like a student's (preview, View),
 * with a missing one uploadable, and kept with the record when it is created.
 */
const PNG = "data:image/png;base64,iVBORw0KGgo=";
const PDF = "data:application/pdf;base64,JVBERi0=";
let record: Record<string, unknown> = {};
const saved: Array<{ branchId: string; slot: { table: string; column: string }; file: Record<string, unknown> }> = [];
const picked = vi.fn((..._a: unknown[]) => Promise.resolve({ name: "lab.jpg", dataUrl: PNG }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/export", () => ({ pickImage: (...a: unknown[]) => picked(...a) }));
vi.mock("@/lib/supabase/data", () => ({
  getBranchDetails: () => Promise.resolve({ success: true, data: record }),
  saveBranchDocument: (branchId: string, slot: { table: string; column: string }, file: Record<string, unknown>) => {
    saved.push({ branchId, slot, file });
    return Promise.resolve({ success: true });
  },
}));

const { branchDocuments } = await import("@/lib/branchDocuments");
const { BranchDocuments } = await import("@/components/branch/BranchDocuments");
const { UploadTile } = await import("@/components/branch/UploadTile");

beforeEach(() => {
  saved.length = 0;
  picked.mockClear();
  record = {
    id: "b1",
    name: "Digiskills",
    branchMohar: { name: "mohar.png", dataUrl: PNG, uploadedAt: "2026-10-20T10:00:00Z" },
    statusDocument: { name: "status.pdf", dataUrl: PDF },
    // An older record keeps a bare data URL.
    branchLogo: PNG,
    director: { name: "Nagendra", aadharFront: { dataUrl: PDF, name: "aadhar.pdf" }, photo: null },
  };
});

describe("branch documents", () => {
  it("reads every slot from the branch and its director, whatever shape it was stored in", () => {
    const docs = branchDocuments(record);
    expect(docs.map((d) => [d.slot.label, d.file?.kind ?? null])).toEqual([
      ["Branch Mohar (Stamp)", "image"],
      ["Branch Photo", null],
      ["Lab Photo", null],
      ["Status Document", "pdf"],
      ["Branch Logo", "image"],
      ["Director Photo", null],
      ["Director Signature", null],
      ["Director Aadhar (Front)", "pdf"],
      ["Director Aadhar (Back)", null],
    ]);
    expect(branchDocuments(null).every((d) => d.file === null)).toBe(true);
  });

  it("shows what is on file, opens it full size, and uploads a missing one", async () => {
    render(<BranchDocuments branchId="b1" organizationId="org1" branchName="Digiskills" canUpload />);
    expect(await screen.findByText("4 of 9 documents on file — upload the missing ones below.")).toBeInTheDocument();
    expect(screen.getAllByText("Not uploaded")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "Open Branch Mohar (Stamp)" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Branch Mohar (Stamp)")).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: "Branch Mohar (Stamp)" })).toHaveAttribute("src", PNG);
    fireEvent.keyDown(dialog, { key: "Escape" });

    fireEvent.click(screen.getByRole("button", { name: "Upload Lab Photo" }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(picked).toHaveBeenCalledWith("image/*");
    expect(saved[0]).toMatchObject({ branchId: "b1", slot: { table: "branches", column: "labPhoto" }, file: { name: "lab.jpg", dataUrl: PNG } });

    // A paper may be a PDF, and the director's go on the director's row.
    fireEvent.click(screen.getByRole("button", { name: "Upload Director Aadhar (Back)" }));
    await waitFor(() => expect(saved).toHaveLength(2));
    expect(picked).toHaveBeenLastCalledWith("image/*,application/pdf");
    expect(saved[1].slot).toMatchObject({ table: "branch_directors", column: "aadharBack" });
  });

  it("only shows the documents without the upload buttons when uploading is not allowed", async () => {
    render(<BranchDocuments branchId="b1" organizationId="org1" branchName="Digiskills" />);
    expect(await screen.findByText("4 of 9 documents on file.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Upload / })).toBeNull();
    expect(screen.getAllByRole("button", { name: "View" })).toHaveLength(4);
  });

  // Registration: the chosen file goes with the form, not just its name, so
  // Create Branch can save it with the new centre.
  it("hands the chosen file to the registration form", async () => {
    let data: FormData | null = null;
    render(
      <form onSubmit={(e) => { e.preventDefault(); data = new FormData(e.currentTarget); }}>
        <UploadTile name="statusDocument" label="Status Document" hint="Upload" accept="image/*,application/pdf" />
        <button type="submit">Save</button>
      </form>,
    );
    picked.mockResolvedValueOnce({ name: "status.pdf", dataUrl: PDF });
    fireEvent.click(screen.getByRole("button", { name: "Choose File" }));
    expect(await screen.findByText("status.pdf")).toBeInTheDocument();
    expect(picked).toHaveBeenCalledWith("image/*,application/pdf");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(data!.get("statusDocument")).toBe("status.pdf");
    expect(JSON.parse(String(data!.get("statusDocumentFile")))).toMatchObject({ name: "status.pdf", dataUrl: PDF });
  });
});
