import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({ supabase: {} }));

import {
  normaliseCode,
  rewardFor,
  suggestCode,
  summariseReferrals,
  validatePercent,
  validateReferral,
  type ReferralCode,
  type ReferralFormValues,
} from "@/lib/supabase/teacherReferrals";
import { canAccess, menuForView } from "@/lib/navigation";

const CODES: ReferralCode[] = [
  { id: "c1", organizationId: "org1", userId: "t1", code: "PRIYA-4821", commissionPercent: 12.5, isActive: true },
  { id: "c2", organizationId: "org1", userId: "t2", code: "AMIT-1000", commissionPercent: 10, isActive: false },
];

const form = (over: Partial<ReferralFormValues> = {}): ReferralFormValues => ({
  code: "priya-4821",
  referredName: "Neha Joshi",
  referredPhone: "9876543210",
  referredEmail: "",
  joinedOn: "2026-11-20",
  baseAmount: "5000",
  note: "",
  ...over,
});

describe("teacher referral codes", () => {
  it("normalises a quoted code", () => {
    expect(normaliseCode("  priya 4821 ")).toBe("PRIYA4821");
  });

  it("suggests a code from the teacher's first name", () => {
    expect(suggestCode("Priya Shinde", () => 0)).toBe("PRIYA-1000");
    expect(suggestCode("Prof. Amit Kulkarni", () => 0.5)).toBe("PROF-5500");
    expect(suggestCode("", () => 0)).toBe("TEACH-1000");
  });

  it("accepts percentages from 0 to 100 only", () => {
    expect(validatePercent("10")).toBeNull();
    expect(validatePercent("12.5")).toBeNull();
    expect(validatePercent("101")).not.toBeNull();
    expect(validatePercent("-1")).not.toBeNull();
    expect(validatePercent("abc")).not.toBeNull();
  });
});

describe("validateReferral", () => {
  it("resolves the code to its teacher and freezes their rate", () => {
    const { value, errors } = validateReferral(form(), CODES);
    expect(errors).toEqual({});
    expect(value).toMatchObject({
      referrerUserId: "t1",
      codeUsed: "PRIYA-4821",
      commissionPercent: 12.5,
      baseAmount: 5000,
      referredPhone: "9876543210",
      referredEmail: null,
    });
  });

  it("refuses an unknown or switched-off code", () => {
    expect(validateReferral(form({ code: "NOPE-0000" }), CODES).errors.code).toMatch(/no teacher/i);
    expect(validateReferral(form({ code: "AMIT-1000" }), CODES).errors.code).toMatch(/switched off/i);
  });

  it("needs a name and a valid amount", () => {
    const { errors, value } = validateReferral(form({ referredName: " ", baseAmount: "12.345" }), CODES);
    expect(value).toBeNull();
    expect(errors.referredName).toBeTruthy();
    expect(errors.baseAmount).toBeTruthy();
  });
});

describe("rewards", () => {
  it("works the reward out to the paisa", () => {
    expect(rewardFor(5000, 12.5)).toBe(625);
    expect(rewardFor(999.99, 10)).toBe(100);
  });

  it("splits pending, owed and paid, and leaves rejected out", () => {
    expect(
      summariseReferrals([
        { status: "PENDING", rewardAmount: 100 },
        { status: "APPROVED", rewardAmount: 250.5 },
        { status: "PAID", rewardAmount: 400 },
        { status: "REJECTED", rewardAmount: 999 },
      ]),
    ).toEqual({ count: 3, pending: 100, owed: 250.5, paid: 400 });
  });
});

describe("referral pages in the menu", () => {
  const urls = (view: "admin" | "franchise") => menuForView(view).flatMap((g) => g.items.map((i) => i.url));

  it("gives the organisation the codes and payouts pages", () => {
    expect(urls("admin")).toEqual(expect.arrayContaining(["/teacher-referral/codes", "/teacher-referral/referrals"]));
  });

  it("gives branch logins (teachers) only their own referral page", () => {
    expect(urls("franchise")).toContain("/teacher-referral/my");
    expect(canAccess("franchise", "/teacher-referral/codes")).toBe(false);
    expect(canAccess("franchise", "/teacher-referral/referrals")).toBe(false);
    expect(canAccess("student", "/teacher-referral/my")).toBe(false);
  });
});
