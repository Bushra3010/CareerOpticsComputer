import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { formatPhone, normalisePhone, telHref, whatsappHref } from "@/lib/phone";
import { StudentContact } from "@/components/student/StudentContact";
import { StudentRoster } from "@/components/student/StudentRoster";
import type { StudentRosterRow } from "@/lib/supabase/data";

describe("phone helpers", () => {
  it("reduces every way a branch types a number to the same subscriber number", () => {
    for (const typed of [
      "9822041100",
      "+91 98220 41100",
      "+919822041100",
      "098220-41100",
      "91 98220 41100",
    ]) {
      expect(normalisePhone(typed)).toBe("9822041100");
    }
  });

  it("refuses a half-filled record rather than producing a dead link", () => {
    for (const empty of ["", "   ", null, undefined, "98220", "n/a"]) {
      expect(normalisePhone(empty)).toBeNull();
      expect(telHref(empty)).toBeNull();
      expect(whatsappHref(empty)).toBeNull();
    }
  });

  it("builds the dialling and WhatsApp forms the two apps actually expect", () => {
    expect(telHref("+91 98220 41100")).toBe("tel:+919822041100");
    // wa.me wants full international form, no `+` and no separators.
    expect(whatsappHref("+91 98220 41100")).toBe("https://wa.me/919822041100");
    expect(whatsappHref("9822041100")).toBe("https://wa.me/919822041100");
  });

  it("shows an undialable value as typed, so the office can see what to correct", () => {
    expect(formatPhone("+919822041100")).toBe("+91 98220 41100");
    expect(formatPhone("98220")).toBe("98220");
    expect(formatPhone("")).toBe("—");
  });
});

describe("StudentContact", () => {
  it("calls and messages the student's own number, not the guardian's", () => {
    render(<StudentContact name="Aarav Sharma" phone="+91 98220 41100" whatsapp="" />);

    expect(screen.getByLabelText("Call Aarav Sharma")).toHaveAttribute("href", "tel:+919822041100");
    // A blank WhatsApp box means the student uses WhatsApp on the mobile they
    // gave at admission — it must never fall through to a different person.
    expect(screen.getByLabelText("WhatsApp Aarav Sharma")).toHaveAttribute(
      "href",
      "https://wa.me/919822041100",
    );
    expect(screen.getByText("+91 98220 41100")).toBeInTheDocument();
  });

  it("prefers the WhatsApp number when the student gave a separate one", () => {
    render(<StudentContact name="Aarav Sharma" phone="9822041100" whatsapp="9000000001" />);

    expect(screen.getByLabelText("Call Aarav Sharma")).toHaveAttribute("href", "tel:+919822041100");
    expect(screen.getByLabelText("WhatsApp Aarav Sharma")).toHaveAttribute(
      "href",
      "https://wa.me/919000000001",
    );
  });

  it("drops both actions when the record holds no number, rather than offering dead buttons", () => {
    render(<StudentContact name="Aarav Sharma" phone="" whatsapp={null} />);

    expect(screen.queryByLabelText("Call Aarav Sharma")).toBeNull();
    expect(screen.queryByLabelText("WhatsApp Aarav Sharma")).toBeNull();
    expect(screen.getByText("No number on record")).toBeInTheDocument();
  });
});
