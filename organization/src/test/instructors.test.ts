import { describe, it, expect } from "vitest";

import { listNames, mergeNames, renameInList, splitNames } from "@/lib/instructors";

describe("splitNames", () => {
  it("reads a comma list, trimming and dropping blanks", () => {
    expect(splitNames(" Prabhat Sir ,Vikram,, ")).toEqual(["Prabhat Sir", "Vikram"]);
    expect(splitNames(null)).toEqual([]);
  });
});

describe("renameInList", () => {
  it("renames the teacher and leaves the others alone", () => {
    expect(renameInList("Prabhat Sir, Vikram", "Vikram", "Vikram Singh")).toBe(
      "Prabhat Sir, Vikram Singh",
    );
  });

  // Substring matching would turn "Rajesh" into "Raj Kumaresh".
  it("matches the whole name, never part of another", () => {
    expect(renameInList("Rajesh, Raj", "Raj", "Raj Kumar")).toBe("Rajesh, Raj Kumar");
    expect(renameInList("Rajesh", "Raj", "Raj Kumar")).toBe("Rajesh");
  });

  it("matches however the name was capitalised, and writes the new spelling", () => {
    expect(renameInList("pushpak kumar", "Pushpak Kumar", "Pushpak Kumar")).toBe("Pushpak Kumar");
  });

  // Otherwise a batch ends up listing the same teacher twice.
  it("collapses into one when the new name is already there", () => {
    expect(renameInList("Vikram, Vikram Singh", "Vikram", "Vikram Singh")).toBe("Vikram Singh");
  });

  it("changes nothing when the name is not in the list", () => {
    expect(renameInList("Prabhat Sir", "Vikram", "Vikram Singh")).toBe("Prabhat Sir");
    expect(renameInList("", "Vikram", "Vikram Singh")).toBe("");
  });
});

describe("listNames", () => {
  it("finds a whole name, whatever the case", () => {
    expect(listNames("Prabhat Sir, Vikram", "vikram")).toBe(true);
    expect(listNames("Rajesh", "Raj")).toBe(false);
  });
});

describe("mergeNames", () => {
  // "vikram" on one batch and "Vikram" in the list are one teacher.
  it("merges case-insensitively, keeping the first spelling met", () => {
    expect(mergeNames(["Vikram", "Prabhat Sir"], ["vikram", "Singhal Sir"])).toEqual([
      "Prabhat Sir",
      "Singhal Sir",
      "Vikram",
    ]);
  });
});
