import { describe, it, expect } from "vitest";
import { admissionView, paymentFor, requestedDocuments, uploadedDocuments } from "@/lib/onlineAdmissions";

describe("Online Admission List, read from the record", () => {
  it("lists the documents the admission form actually stored", () => {
    const docs = uploadedDocuments({
      documents: {
        tenthMarksheet: { name: "10th.pdf", dataUrl: "data:...", uploadedAt: "x" },
        aadharCardFront: { name: "a.jpg", dataUrl: "data:...", uploadedAt: "x" },
        aadharCardBack: { name: "b.jpg", dataUrl: "data:...", uploadedAt: "x" },
      },
      photo: "data:image/png;base64,...",
    });
    expect(docs.sort()).toEqual(["10th Marksheet", "Aadhar", "Photo"]);
  });

  it("shows none for a record with nothing uploaded", () => {
    expect(uploadedDocuments({ documents: null })).toEqual([]);
  });

  it("reads the decision from admissionStatus, the column that exists", () => {
    expect(admissionView({ admissionStatus: "APPROVED" })).toBe("approved");
    expect(admissionView({ admissionStatus: "REJECTED" })).toBe("rejected");
    expect(admissionView({ admissionStatus: "SUBMITTED" })).toBe("pending");
    // There is no UNDER_REVIEW in the enum: the documents asked for mark it.
    expect(admissionView({ admissionStatus: "SUBMITTED", requestedDocuments: "Photo, Aadhar" })).toBe("under_review");
  });

  it("reads the requested documents as stored, text or array", () => {
    expect(requestedDocuments({ requestedDocuments: "Photo, Aadhar" })).toEqual(["Photo", "Aadhar"]);
    expect(requestedDocuments({ requestedDocuments: ["Photo"] })).toEqual(["Photo"]);
    expect(requestedDocuments({})).toEqual([]);
  });

  it("takes payment from the student's invoices, not a fixed 'pending'", () => {
    expect(paymentFor([])).toBe("none");
    expect(paymentFor([{ id: "i1", totalAmount: 1000, paidAmount: 1000, status: "PAID" }])).toBe("paid");
    expect(paymentFor([{ id: "i1", totalAmount: 1000, paidAmount: 400, status: "PARTIAL" }])).toBe("pending");
    expect(
      paymentFor([
        { id: "i1", totalAmount: 1000, paidAmount: 1000, status: "PAID" },
        { id: "i2", totalAmount: 500, paidAmount: 0, status: "DUE" },
      ]),
    ).toBe("pending");
  });
});
