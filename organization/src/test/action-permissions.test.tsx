import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { actionOf, actionsOn, allows, labelAllowed, type Permissions } from "@/lib/permissions";

/**
 * A role may open a page and still be held to View only, or to Add but not
 * Delete. The rules read what a control does from its words, the guard stops
 * a refused click before the page acts on it, and the table leaves refused
 * row actions out of its menu.
 */
describe("permission rules", () => {
  it("reads the action from a control's words", () => {
    expect(actionOf("Add subject")).toBe("create");
    expect(actionOf("+ New admission")).toBe("create");
    expect(actionOf("Generate certificate")).toBe("create");
    expect(actionOf("Collect fee")).toBe("create");
    expect(actionOf("Update result")).toBe("edit");
    expect(actionOf("Edit")).toBe("edit");
    expect(actionOf("Delete")).toBe("delete");
    expect(actionOf("Remove")).toBe("delete");
    expect(actionOf("Download CSV")).toBe("export");
    expect(actionOf("Export")).toBe("export");
    expect(actionOf("Print marksheet")).toBe("print");
    expect(actionOf("Download PDF")).toBe("print");
    expect(actionOf("Approve")).toBe("approve");
    expect(actionOf("Save permissions")).toBe("save");
    expect(actionOf("Cancel")).toBeNull();
    expect(actionOf("Search")).toBeNull();
    expect(actionOf("Ram Kumar")).toBeNull();
  });

  it("keeps every action on a page with no entry, and only the listed ones otherwise", () => {
    const perms: Permissions = { "/exam/results": ["create", "print"] };
    expect(actionsOn(perms, "/fee/collection")).toHaveLength(6);
    expect(allows(perms, "/exam/results", "create")).toBe(true);
    expect(allows(perms, "/exam/results", "delete")).toBe(false);
    expect(labelAllowed(perms, "/exam/results", "Delete")).toBe(false);
    expect(labelAllowed(perms, "/exam/results", "Print marksheet")).toBe(true);
    // "Save" passes on either add or edit.
    expect(labelAllowed(perms, "/exam/results", "Save result")).toBe(true);
    expect(labelAllowed({ "/x": ["delete"] }, "/x", "Save")).toBe(false);
    expect(labelAllowed({ "/x": [] }, "/x", "Cancel")).toBe(true);
  });
});

const toast = vi.fn();
let perms: Permissions = {};
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ permissions: perms }),
}));
vi.mock("@/contexts/PermissionsContext", () => ({
  usePermissionsOrNull: () => perms,
}));

const { PermissionGuard } = await import("@/components/layout/PermissionGuard");
const { DataTable } = await import("@/components/ui/DataTable");

beforeEach(() => {
  toast.mockClear();
  perms = {};
});

describe("PermissionGuard", () => {
  const page = (onAdd: () => void, onDelete: () => void, onSearch: () => void) => (
    <MemoryRouter initialEntries={["/exam/results"]}>
      <PermissionGuard>
        <button onClick={onAdd}>Add subject</button>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onSearch}>Search</button>
        <button data-perm="export" onClick={onSearch}>Report</button>
      </PermissionGuard>
    </MemoryRouter>
  );

  it("does nothing on a page the role is not limited on", () => {
    const add = vi.fn();
    render(page(add, vi.fn(), vi.fn()));
    fireEvent.click(screen.getByText("Add subject"));
    expect(add).toHaveBeenCalled();
    expect(screen.getByText("Add subject")).not.toHaveAttribute("data-perm-denied");
  });

  it("refuses and explains what the role may not do, and lets the rest through", async () => {
    perms = { "/exam/results": ["create"] };
    const add = vi.fn();
    const del = vi.fn();
    const search = vi.fn();
    render(page(add, del, search));

    fireEvent.click(screen.getByText("Delete"));
    expect(del).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Permission nahi hai" }));
    await waitFor(() => expect(screen.getByText("Delete")).toHaveAttribute("data-perm-denied", "true"));
    expect(screen.getByText("Report")).toHaveAttribute("data-perm-denied", "true");

    fireEvent.click(screen.getByText("Add subject"));
    fireEvent.click(screen.getByText("Search"));
    expect(add).toHaveBeenCalled();
    expect(search).toHaveBeenCalled();
    expect(screen.getByText("Add subject")).not.toHaveAttribute("data-perm-denied");
  });
});

describe("DataTable row actions", () => {
  it("leaves out the actions the role may not perform", async () => {
    perms = { "/exam/results": ["print"] };
    render(
      <MemoryRouter initialEntries={["/exam/results"]}>
        <DataTable
          data={[{ id: "1", name: "Ram" }]}
          columns={[{ key: "name", header: "Name" }]}
          actions={() => [
            { label: "Edit", onClick: vi.fn() },
            { label: "Print marksheet", onClick: vi.fn() },
            { label: "Delete", onClick: vi.fn(), destructive: true },
          ]}
        />
      </MemoryRouter>,
    );
    const trigger = document.querySelector("td button") as HTMLElement;
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(await screen.findByText("Print marksheet")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).toBeNull();
    expect(screen.queryByText("Delete")).toBeNull();
  });
});
