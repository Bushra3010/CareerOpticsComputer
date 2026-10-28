import { afterEach, describe, expect, it } from "vitest";
import { printCardSheets } from "@/lib/export";

/** ID cards print at their real size, as many to an A4 sheet as fit. */
const printed = () => {
  const frame = document.querySelector("iframe")!;
  return frame.contentDocument!;
};
const card = (width: number, height: number) => ({ html: "<b>card</b>", width, height });

afterEach(() => document.querySelectorAll("iframe").forEach((f) => f.remove()));

describe("printCardSheets", () => {
  it("puts ten landscape cards on a sheet, two across and five down", () => {
    printCardSheets("Cards", Array.from({ length: 12 }, () => card(1011, 638)));
    const sheets = printed().querySelectorAll(".sheet");
    expect(sheets).toHaveLength(2);
    expect(sheets[0].querySelectorAll(".row")).toHaveLength(5);
    expect(sheets[0].querySelectorAll(".card")).toHaveLength(10);
    expect(sheets[1].querySelectorAll(".card")).toHaveLength(2);
    // The real size of an ID card, not a page each.
    expect((sheets[0].querySelector(".card") as HTMLElement).style.width).toBe("85.6mm");
    expect(printed().title).toBe("Cards");
    expect(printed().querySelector("h1")).toBeNull();
  });

  it("puts nine portrait cards on a sheet, three by three", () => {
    printCardSheets("Cards", Array.from({ length: 9 }, () => card(638, 1011)));
    const sheets = printed().querySelectorAll(".sheet");
    expect(sheets).toHaveLength(1);
    expect(sheets[0].querySelectorAll(".row")).toHaveLength(3);
    expect([...sheets[0].querySelectorAll(".row")].map((r) => r.children.length)).toEqual([3, 3, 3]);
    expect((sheets[0].querySelector(".card") as HTMLElement).style.height).toBe("85.6mm");
  });
});
