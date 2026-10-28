import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { downloadName, fileKind, studentFiles, toObjectUrl } from "@/lib/studentDocuments";
import { StudentDocuments } from "@/components/student/StudentDocuments";

/**
 * The files a student uploaded are on their record -- in the documents column
 * or, on older records, in columns of their own -- and the office can open
 * each one: images inline, PDFs in a frame, both downloadable.
 */
const PNG = "data:image/png;base64,iVBORw0KGgo=";
const PDF = "data:application/pdf;base64,JVBERi0xLjQK";

beforeAll(() => {
  // jsdom has no object URLs.
  URL.createObjectURL = vi.fn(() => "blob:test");
  URL.revokeObjectURL = vi.fn();
});

describe("studentFiles", () => {
  it("reads the documents column and older columns, in the form's order", () => {
    const files = studentFiles({
      documents: {
        aadharCardFront: { name: "aadhar.png", dataUrl: PNG, uploadedAt: "2026-10-01T10:00:00Z" },
        tenthMarksheet: { name: "10th.pdf", dataUrl: PDF, uploadedAt: "" },
        twelfthMarksheet: { name: "empty", dataUrl: "" },
      },
      photo: PNG,
      aadharFront: "data:image/png;base64,OLD",
    });
    expect(files.map((f) => [f.key, f.label, f.kind])).toEqual([
      ["passportPhoto", "Passport Photo", "image"],
      ["tenthMarksheet", "10th Marksheet", "pdf"],
      ["aadharCardFront", "Aadhar Card (Front)", "image"],
    ]);
    // The documents column wins over the older column for the same slot.
    expect(files.find((f) => f.key === "aadharCardFront")?.name).toBe("aadhar.png");
  });

  it("accepts a JSON string column and ignores what is not a file", () => {
    expect(studentFiles({ documents: JSON.stringify({ admissionForm: { dataUrl: PDF } }) })).toHaveLength(1);
    expect(studentFiles({ documents: { x: "not a url" }, photo: null })).toEqual([]);
    expect(studentFiles(null)).toEqual([]);
  });

  it("names and converts files for saving", () => {
    expect(fileKind(PDF)).toBe("pdf");
    expect(fileKind("https://x/y.jpg")).toBe("image");
    expect(downloadName({ key: "k", label: "Aadhar Card (Front)", name: "", url: PNG, uploadedAt: "", kind: "image" }, "Ram Kumar")).toBe(
      "ram-kumar-aadhar-card-front-.png",
    );
    expect(toObjectUrl("https://x/y.pdf")).toBe("https://x/y.pdf");
    expect(toObjectUrl(PDF)).toBe("blob:test");
  });
});

describe("StudentDocuments", () => {
  it("opens an image and a PDF full size", () => {
    render(
      <StudentDocuments
        studentName="Ram Kumar"
        record={{ documents: { passportPhoto: { name: "me.png", dataUrl: PNG }, tenthMarksheet: { name: "10th.pdf", dataUrl: PDF } } }}
      />,
    );
    expect(screen.getByText("Passport Photo")).toBeInTheDocument();
    const views = screen.getAllByRole("button", { name: "View" });
    expect(views).toHaveLength(2);

    fireEvent.click(views[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByAltText("Passport Photo").length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: "Download Passport Photo" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    fireEvent.click(screen.getAllByRole("button", { name: "View" })[1]);
    expect(document.querySelector("iframe")).toHaveAttribute("src", "blob:test");
  });

  it("says so when nothing was uploaded", () => {
    render(<StudentDocuments record={{}} emptyText="No documents uploaded." />);
    expect(screen.getByText("No documents uploaded.")).toBeInTheDocument();
  });
});
