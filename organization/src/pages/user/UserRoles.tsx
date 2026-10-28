import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Shield, SlidersHorizontal, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { canManageUsers, grantableRoles } from "@/lib/supabase/data";
import {
  createRole,
  deleteRole,
  getRoleUserCounts,
  getRoles,
  updateRole,
  type RoleRow,
  type SystemRole,
} from "@/lib/supabase/data";
import { viewForRole } from "@/lib/roles";

/**
 * The institute's own roles.
 *
 * This page used to list four roles -- Admin, Manager, Employee, HR Manager --
 * that existed nowhere but this file: creating one did nothing, and the Add
 * User dialog offered a different list entirely. These are the real ones now,
 * and what each may open is set next door under Access Control.
 *
 * A role's `base` is the part the database enforces: an account is minted as
 * one of the eight `SystemRole` values, because every RLS policy reads that.
 * A role named "Counsellor" is a base of STAFF wearing a name, and its module
 * list only narrows what that base could already reach.
 */

/** What a base role means, in the words an administrator picks it by. */
const BASE_LABELS: Record<string, { label: string; help: string }> = {
  ORGANIZATION_ADMIN: {
    label: "Organisation-wide",
    help: "Sees every branch, and the institute's settings.",
  },
  BRANCH_ADMIN: {
    label: "Runs a branch",
    help: "One branch, with its staff and its admissions.",
  },
  ACCOUNTANT: { label: "Branch staff — accounts", help: "One branch, fees side." },
  RECEPTIONIST: { label: "Branch staff — front desk", help: "One branch, reception side." },
  TEACHER: { label: "Branch staff — teaching", help: "One branch, classes and marks." },
  STAFF: { label: "Branch staff — general", help: "One branch, whatever you grant." },
};

const baseLabel = (base: string) => BASE_LABELS[base]?.label ?? base;

const BLANK = { name: "", description: "", baseRole: "STAFF" as SystemRole };

export default function UserRoles() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, organizationId } = useAuth();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [notInstalled, setNotInstalled] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RoleRow | null>(null);

  // A branch admin may staff their own branch, so they see the roles they can
  // hand out; only the organisation shapes the roles themselves.
  const mayEdit = viewForRole(user?.role) === "admin" && canManageUsers(user?.role);
  const bases = useMemo(
    () => grantableRoles(user?.role).filter((role) => role !== "SUPER_ADMIN"),
    [user?.role],
  );

  const load = async () => {
    setLoading(true);
    try {
      const [list, used] = await Promise.all([
        getRoles(organizationId),
        getRoleUserCounts(organizationId),
      ]);
      setRoles(list.data);
      setCounts(used.data);
      // An organisation with no roles at all means roles.sql has not been run:
      // the app still works on its eight built-in roles, so say that plainly
      // rather than showing an empty table as though none had been made.
      setNotInstalled(list.data.length === 0);
    } catch (error) {
      toast({
        title: "Could not load the roles",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const openCreate = () => {
    setDraft({ ...BLANK, baseRole: (bases[bases.length - 1] ?? "STAFF") as SystemRole });
    setCreating(true);
  };

  const openEdit = (role: RoleRow) => {
    setDraft({ name: role.name, description: role.description, baseRole: role.baseRole });
    setEditing(role);
  };

  const save = async () => {
    const name = draft.name.trim();
    if (!name) {
      toast({ title: "Give the role a name", variant: "destructive" });
      return;
    }
    if (!organizationId) {
      toast({ title: "No organisation assigned", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        // A built-in role's base is fixed: the eight are what the database
        // knows, and renaming one must not quietly re-point it somewhere else.
        await updateRole(editing.id, {
          name,
          description: draft.description,
          ...(editing.isSystem ? {} : { baseRole: draft.baseRole }),
        });
        toast({ title: "Role saved", description: `"${name}" updated.` });
      } else {
        await createRole(organizationId, {
          name,
          description: draft.description,
          baseRole: draft.baseRole,
        });
        toast({
          title: "Role created",
          description: `"${name}" can now be given out under Add user. Set what it opens under Access Control.`,
        });
      }
      setEditing(null);
      setCreating(false);
      await load();
    } catch (error) {
      toast({
        title: editing ? "Could not save the role" : "Could not create the role",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRole(pendingDelete.id);
      toast({
        title: "Role deleted",
        description: `"${pendingDelete.name}" is gone. Anyone holding it keeps their login and falls back to their base menu.`,
      });
      setPendingDelete(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not delete the role",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="User Roles"
        description="The jobs people do at this institute, and what each of them may open."
        breadcrumbs={[{ label: "User Management", href: "/user/all" }, { label: "User Roles" }]}
        actions={
          mayEdit && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => navigate("/user/access-control")}>
                <SlidersHorizontal className="h-4 w-4" />
                Access control
              </Button>
              <Button className="gap-2" onClick={openCreate} disabled={notInstalled}>
                <Plus className="h-4 w-4" />
                New role
              </Button>
            </div>
          )
        }
      />

      {notInstalled && !loading && (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            <p className="font-medium">Roles are not set up on this database yet.</p>
            <p className="mt-1 text-muted-foreground">
              Run <code>supabase/schema/roles.sql</code> in the Supabase SQL editor. Until then
              everyone keeps the menu their built-in role has always had, and nothing here can be
              saved.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      <Shield className="h-4 w-4 text-primary" />
                      {role.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {role.description || "No description"}
                    </p>
                  </div>
                  {role.isSystem ? (
                    <Badge variant="secondary" className="shrink-0">
                      Built in
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">
                      Custom
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">{baseLabel(role.baseRole)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {counts[role.id] ?? 0} {(counts[role.id] ?? 0) === 1 ? "user" : "users"}
                  </span>
                  <span>
                    {role.modules.length === 0
                      ? "Full menu for its level"
                      : `${role.modules.length} pages`}
                  </span>
                </div>

                {mayEdit && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openEdit(role)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate(`/user/access-control?role=${role.id}`)}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Permissions
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-destructive"
                        aria-label={`Delete ${role.name}`}
                        onClick={() => setPendingDelete(role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {roles.length === 0 && !notInstalled && (
            <p className="text-sm text-muted-foreground">No roles yet.</p>
          )}
        </div>
      )}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : "New role"}</DialogTitle>
            <DialogDescription>
              The name is yours to choose. The level decides what the database itself lets this
              role do — the pages it sees are set under Access Control.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name *</Label>
              <Input
                id="role-name"
                placeholder="Counsellor"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                rows={2}
                placeholder="What this person does at the institute."
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-base">Level *</Label>
              <Select
                value={draft.baseRole}
                onValueChange={(value) => setDraft((d) => ({ ...d, baseRole: value as SystemRole }))}
                disabled={Boolean(editing?.isSystem)}
              >
                <SelectTrigger id="role-base">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {bases.map((base) => (
                    <SelectItem key={base} value={base}>
                      {baseLabel(base)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {editing?.isSystem
                  ? "A built-in role's level cannot change — the database keys its own rules on it."
                  : BASE_LABELS[draft.baseRole]?.help}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save role" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {counts[pendingDelete?.id ?? ""] ?? 0} login(s) hold this role. They keep working and
              fall back to the menu their level has always had — but they lose whatever this role
              granted them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete role</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
