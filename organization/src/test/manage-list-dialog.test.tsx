import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ManageListDialog, type ManageListResult } from "@/components/ui/ManageListDialog";

/**
 * Renaming and removing the entries of a picker list. What the caller does
 * with the result depends on telling a rename apart from a delete-and-add —
 * a renamed teacher is renamed on their batches too — so that is what these
 * pin down.
 */
const setup = (props: Partial<React.ComponentProps<typeof ManageListDialog>> = {}) => {
  const onSave = vi.fn<(r: ManageListResult) => Promise<void>>(() => Promise.resolve());
  const onOpenChange = vi.fn();
  render(
    <ManageListDialog
      open
      onOpenChange={onOpenChange}
      title="Teachers"
      items={["Prabhat Sir", "Vikram", "Singhal Sir"]}
      onSave={onSave}
      {...props}
    />,
  );
  return { onSave, onOpenChange };
};

const field = (n: number) => screen.getByLabelText(`Teachers ${n}`);
const save = () => fireEvent.click(screen.getByRole("button", { name: "Save" }));

describe("ManageListDialog", () => {
  it("reports a rename as a rename, not a removal and an addition", async () => {
    const { onSave } = setup();
    fireEvent.change(field(2), { target: { value: "Vikram Singh" } });
    save();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const result = onSave.mock.calls[0][0];
    expect(result.renames).toEqual([{ from: "Vikram", to: "Vikram Singh" }]);
    expect(result.removed).toEqual([]);
    expect(result.values).toEqual(["Prabhat Sir", "Vikram Singh", "Singhal Sir"]);
  });

  it("removes an entry on save", async () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Remove Vikram" }));
    save();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      values: ["Prabhat Sir", "Singhal Sir"],
      removed: ["Vikram"],
    });
  });

  // A phone-sized screen puts the trash icon a thumb's width from the input.
  it("lets a removal be taken back before saving", async () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Remove Vikram" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep Vikram" }));
    save();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].removed).toEqual([]);
    expect(onSave.mock.calls[0][0].values).toContain("Vikram");
  });

  it("adds a new entry, which is neither a rename nor a removal", async () => {
    const { onSave } = setup();
    fireEvent.change(screen.getByPlaceholderText("New teacher"), { target: { value: "Neha Ma'am" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    save();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toMatchObject({ renames: [], removed: [] });
    expect(onSave.mock.calls[0][0].values).toContain("Neha Ma'am");
  });

  it("takes a name still typed in the box when Save is pressed", async () => {
    const { onSave } = setup();
    fireEvent.change(screen.getByPlaceholderText("New teacher"), { target: { value: "Amit Sir" } });
    save();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].values).toContain("Amit Sir");
  });

  // Removing a teacher who is on a batch would not take them off the batch,
  // so they would be back on the next load.
  it("offers no remove on a locked entry, and says why", () => {
    setup({ locked: { vikram: "Teaches Morning Batch" } });

    expect(screen.queryByRole("button", { name: "Remove Vikram" })).toBeNull();
    expect(screen.getByLabelText(/Vikram cannot be removed: Teaches Morning Batch/)).toBeInTheDocument();
    // Still renameable.
    expect(field(2)).not.toBeDisabled();
  });

  it("refuses to go below the minimum, and says why", async () => {
    const { onSave } = setup({ items: ["Algorithms"], minItems: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Remove Algorithms" }));
    save();

    expect(await screen.findByText(/keep at least 1/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("refuses the same name twice, whatever the case", async () => {
    const { onSave } = setup();
    fireEvent.change(field(3), { target: { value: "vikram" } });
    save();

    expect(await screen.findByText(/on the list twice/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("refuses a name cleared to nothing, pointing at Remove instead", async () => {
    const { onSave } = setup();
    fireEvent.change(field(1), { target: { value: "   " } });
    save();

    expect(await screen.findByText(/cannot be left blank/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("shows the reason when the save itself fails, and stays open", async () => {
    const { onSave, onOpenChange } = setup();
    onSave.mockRejectedValueOnce(new Error("RLS said no"));
    fireEvent.change(field(2), { target: { value: "Vikram Singh" } });
    save();

    expect(await screen.findByText("RLS said no")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
