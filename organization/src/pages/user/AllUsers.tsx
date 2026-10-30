import { useCallback, useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Shield, Mail, Phone, UserCheck, Building2, UserPlus, KeyRound, Eye, EyeOff } from "lucide-react";
import { generatePassword, passwordIssue } from "@/lib/passwords";
import { Link } from "react-router-dom";
import {
  getUsers,
  updateUser,
  deleteUser,
  createStaffUser,
  getBranches,
  getRoles,
  setUserRole,
  setUserPassword,
  setUserEmail,
  grantableRoles,
  canManageUsers,
  SYSTEM_ROLES,
  type SystemUserRow,
  type SystemRole,
  type RoleRow,
} from "@/lib/supabase/data";

/** `ORGANIZATION_ADMIN` is not a label. */
const pretty = (value: string) =>
  value
    ? value
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ")
    : "—";

const roleBadgeClass = (role: string) => {
  if (role === "SUPER_ADMIN" || role === "ORGANIZATION_ADMIN") return "bg-purple-100 text-purple-800";
  if (role === "BRANCH_ADMIN") return "bg-blue-100 text-blue-800";
  if (role === "ACCOUNTANT" || role === "TEACHER") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-800";
};

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Never";

const AllUsers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const organizationId = user?.organizationId ?? null;
  const branchId = user?.branchId ?? null;

  const [users, setUsers] = useState<SystemUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [viewing, setViewing] = useState<SystemUserRow | null>(null);
  const [editing, setEditing] = useState<SystemUserRow | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "", roleId: "", isActive: true });
  /* Off until asked for, so a routine edit to a name cannot also reset a
     password, and so it reads as "set a new one" — the current one cannot be
     shown, because Supabase Auth keeps only its hash. */
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SystemUserRow | null>(null);

  // Which roles this admin may hand out, decided by their own role. The edge
  // function re-checks it; this only keeps the form from offering a role the
  // server is going to refuse.
  const creatableRoles = grantableRoles(user?.role);
  const canAdd = canManageUsers(user?.role);
  // A branch admin staffs their own branch and is given no choice about it, so
  // the picker is only worth showing to someone who has branches to pick from.
  const canChooseBranch = !!organizationId;

  /**
   * The institute's own roles. The dropdown offers these by name -- a person is
   * given "Counsellor", not STAFF -- and each carries the base role the account
   * is actually minted as. An organisation that has not run roles.sql has none,
   * and the dropdown falls back to the eight built-in ones.
   */
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const grantableSet = useMemo(() => new Set<string>(creatableRoles), [creatableRoles]);
  const offeredRoles = useMemo(
    () => roles.filter((role) => grantableSet.has(role.baseRole)),
    [roles, grantableSet],
  );
  // The institute's own roles come first and on their own: those are the jobs
  // this office actually has. The six the app ships with stay underneath --
  // hiding them would leave nobody able to create a branch admin until a
  // custom role had been made for it.
  const ownRoles = useMemo(() => offeredRoles.filter((role) => !role.isSystem), [offeredRoles]);
  const builtInRoles = useMemo(() => offeredRoles.filter((role) => role.isSystem), [offeredRoles]);

  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [branchOptions, setBranchOptions] = useState<Array<{ id: string; name: string }>>([]);
  // "none" rather than "": Radix rejects an empty SelectItem value, and head
  // office is a real answer here, not a missing one.
  const blankDraft = {
    name: "",
    username: "",
    password: "",
    role: (creatableRoles[0] ?? "STAFF") as SystemRole,
    /** The institute's role, when it has any. "" means none was chosen. */
    roleId: "",
    email: "",
    phone: "",
    branchId: "none",
  };
  const [draft, setDraft] = useState(blankDraft);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, roleList] = await Promise.all([
        getUsers(organizationId, branchId),
        getRoles(organizationId).catch(() => ({ data: [] as RoleRow[] })),
      ]);
      setUsers(result.data);
      setRoles(roleList.data);
    } catch (error) {
      toast({
        title: "Could not load users",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAdd = async () => {
    setDraft(blankDraft);
    setAdding(true);
    if (!canChooseBranch) return;
    try {
      const result = await getBranches(organizationId);
      setBranchOptions(
        (result.data as Array<{ id: string; name: string }>).map((row) => ({
          id: row.id,
          name: row.name || "Unnamed branch",
        })),
      );
    } catch {
      // The branch is optional -- somebody posted to head office has none -- so
      // a failed list should not stop the user being created.
      setBranchOptions([]);
    }
  };

  const create = async () => {
    if (!draft.name.trim() || !draft.username.trim() || !draft.password) {
      toast({ title: "Name, login ID and password are required", variant: "destructive" });
      return;
    }
    if (draft.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const chosen = offeredRoles.find((role) => role.id === draft.roleId) ?? null;
      const result = await createStaffUser({
        name: draft.name,
        username: draft.username,
        password: draft.password,
        // The account is always minted as one of the eight the database knows;
        // the institute's own role is a name and a menu on top of that.
        role: chosen ? chosen.baseRole : draft.role,
        email: draft.email,
        phone: draft.phone,
        branchId: draft.branchId === "none" ? null : draft.branchId,
      });
      // A separate write, and deliberately after the account exists: this is an
      // ordinary update the admin's own session may make, so adding roles never
      // needed the deployed edge function to be changed.
      if (chosen) await setUserRole(result.data.userId, chosen.id);
      toast({
        title: result.data.created ? "User created" : "Login updated",
        description: `${draft.name.trim()} signs in as ${result.data.username}${
          chosen ? ` as ${chosen.name}` : ""
        }.`,
      });
      setAdding(false);
      await load();
    } catch (error) {
      toast({
        title: "Could not create the user",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (row: SystemUserRow) => {
    setEditing(row);
    setChangePassword(false);
    setNewPassword("");
    setShowPassword(false);
    // Controlled, not `defaultValue`: the old form read nothing back, so every
    // keystroke was thrown away when the dialog closed.
    setForm({
      name: row.name,
      phone: row.phone,
      email: row.email || "",
      role: row.role,
      // "none" rather than "": Radix rejects an empty item value, and holding
      // no role of the institute's own is a real answer here.
      roleId: row.roleId || "none",
      isActive: row.isActive,
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    // Checked before anything is written, so a password that would be refused
    // does not leave the details saved and the password not.
    const passwordProblem = changePassword ? passwordIssue(newPassword) : null;
    if (passwordProblem) {
      toast({ title: "Check the new password", description: passwordProblem, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const chosen = offeredRoles.find((role) => role.id === form.roleId) ?? null;
      await updateUser(editing.id, {
        name: form.name,
        phone: form.phone,
        // A role of the institute's own decides what the account is: its base
        // is what the database reads, so the two cannot be left disagreeing.
        role: chosen ? chosen.baseRole : form.role,
        isActive: form.isActive,
      });
      if (form.roleId !== (editing.roleId || "none")) {
        await setUserRole(editing.id, chosen ? chosen.id : null);
      }
      // Last, and reported on its own: the details are already saved by here,
      // and a refusal (another branch, a higher rank) must say that only the
      // password did not change, not that nothing did.
      // The sign-in email, like the password, changes on the Auth account
      // and is reported on its own if refused.
      const emailChanged = form.email.trim().toLowerCase() !== (editing.email || "").toLowerCase();
      if (emailChanged) {
        try {
          await setUserEmail(editing.id, form.email);
        } catch (error) {
          toast({
            title: "Details saved, email not changed",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          });
          await load();
          return;
        }
      }
      if (changePassword) {
        try {
          await setUserPassword(editing.id, newPassword);
        } catch (error) {
          toast({
            title: "Details saved, password not changed",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          });
          await load();
          return;
        }
      }
      toast({
        title: "User updated",
        description: changePassword
          ? `${form.name.trim()} has been saved with a new password. Tell them what it is — it is not shown again.`
          : `${form.name.trim()} has been saved${chosen ? ` as ${chosen.name}` : ""}.`,
      });
      setEditing(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not save user",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: SystemUserRow) => {
    try {
      await updateUser(row.id, { isActive: !row.isActive });
      toast({
        title: row.isActive ? "User deactivated" : "User activated",
        description: `${row.name || row.email} can ${row.isActive ? "no longer" : "now"} be marked active.`,
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not change status",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteUser(pendingDelete.id);
      toast({ title: "User removed", description: `${pendingDelete.name || pendingDelete.email} is no longer listed.` });
      setPendingDelete(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not remove user",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<SystemUserRow>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name || "—"}</p>
          <p className="text-xs text-muted-foreground">{pretty(row.userType)} login</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="break-all">{row.email || "—"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{row.phone || "—"}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      // The institute's own name for the job where it has one, so the list
      // reads the way the office talks rather than the way the enum does.
      cell: (row) => {
        const own = roles.find((role) => role.id === row.roleId);
        return (
          <Badge className={roleBadgeClass(row.role)}>
            <Shield className="mr-1 h-3 w-3" />
            {own ? own.name : pretty(row.role)}
          </Badge>
        );
      },
    },
    {
      key: "branch",
      header: "Branch / Organisation",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{row.branch || row.organization || "—"}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (row) => (
        <Badge className={row.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          <UserCheck className="mr-1 h-3 w-3" />
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last login",
      sortable: true,
      cell: (row) => <span className="whitespace-nowrap text-sm">{formatDate(row.lastLoginAt)}</span>,
    },
  ];

  const rowActions = (row: SystemUserRow) => [
    { label: "View details", onClick: () => setViewing(row) },
    { label: "Edit user", onClick: () => openEdit(row) },
    { label: row.isActive ? "Deactivate" : "Activate", onClick: () => void toggleActive(row) },
    { label: "Remove user", onClick: () => setPendingDelete(row), destructive: true },
  ];

  const filtered = users.filter((row) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      row.name.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term) ||
      row.branch.toLowerCase().includes(term);
    const matchesRole = filterRole === "all" || row.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || (filterStatus === "active" ? row.isActive : !row.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUsers = users.filter((row) => row.isActive).length;
  const adminUsers = users.filter((row) => row.role.includes("ADMIN")).length;
  // Only the roles actually in use — the list used to offer Admin, Manager and
  // Employee, none of which this database has ever accepted.
  const rolesInUse = [...new Set(users.map((row) => row.role).filter(Boolean))].sort();

  const stats = [
    { label: "Total users", value: users.length, note: "Staff logins", className: "" },
    { label: "Active", value: activeUsers, note: "Currently active", className: "text-green-600" },
    { label: "Inactive", value: users.length - activeUsers, note: "Cannot sign in", className: "text-gray-600" },
    { label: "Administrators", value: adminUsers, note: "Organisation and branch admins", className: "text-purple-600" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="All Users"
          description="Staff logins for this organisation"
          breadcrumbs={[{ label: "User Management", href: "/user/all" }, { label: "All Users" }]}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/branch/view">Manage branch logins</Link>
              </Button>
              {canAdd && (
                <Button onClick={() => void openAdd()}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add user
                </Button>
              )}
            </div>
          }
        />

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.className}`}>{loading ? "—" : stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Filter users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or branch..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger aria-label="Filter by role">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {rolesInUse.map((role) => (
                    <SelectItem key={role} value={role}>
                      {pretty(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger aria-label="Filter by status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading users…" : `Showing ${filtered.length} of ${users.length} users`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>User list</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filtered}
              actions={rowActions}
              searchable={false}
              emptyMessage={
                loading
                  ? "Loading users…"
                  : canAdd
                    ? "No staff logins yet. Use Add user to create one, or set a branch's login from the branch page."
                    : "No staff logins yet. A branch gets one when you set its login from the branch page."
              }
            />
            {/* Every enrolled student has a login too; they are managed with the
                rest of the student record rather than buried in this list. */}
            <p className="mt-4 text-xs text-muted-foreground">
              Student logins are managed under{" "}
              <Link to="/student/view" className="underline">
                Students
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        {/* Add */}
        <Dialog open={adding} onOpenChange={(open) => !open && setAdding(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
              <DialogDescription>
                Creates the sign-in account and lists it here. The person signs in with the login ID, not an email
                address.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full name</Label>
                  <Input
                    id="new-name"
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    placeholder="Priya Sharma"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <Select
                    value={offeredRoles.length ? draft.roleId : draft.role}
                    onValueChange={(value) =>
                      setDraft(
                        offeredRoles.length
                          ? { ...draft, roleId: value }
                          : { ...draft, role: value as SystemRole },
                      )
                    }
                  >
                    <SelectTrigger id="new-role" aria-label="Role for the new user">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {offeredRoles.length === 0
                        ? // Only while roles.sql has not been run.
                          creatableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {pretty(role)}
                            </SelectItem>
                          ))
                        : [
                            ownRoles.length > 0 && (
                              <SelectGroup key="own">
                                <SelectLabel>Your roles</SelectLabel>
                                {ownRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ),
                            builtInRoles.length > 0 && (
                              <SelectGroup key="built-in">
                                <SelectLabel>Built in</SelectLabel>
                                {builtInRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ),
                          ]}
                    </SelectContent>
                  </Select>
                  {offeredRoles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Roles and what each one opens are set under{" "}
                      <Link to="/user/roles" className="text-primary hover:underline">
                        User Roles
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Login ID</Label>
                  <Input
                    id="new-username"
                    autoComplete="off"
                    value={draft.username}
                    onChange={(event) => setDraft({ ...draft, username: event.target.value })}
                    placeholder="priya.sharma"
                  />
                  <p className="text-xs text-muted-foreground">What they type to sign in. Letters, dots and numbers.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={draft.password}
                    onChange={(event) => setDraft({ ...draft, password: event.target.value })}
                    placeholder="At least 6 characters"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hand this to them directly — it is not emailed anywhere.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Contact email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Phone</Label>
                  <Input
                    id="new-phone"
                    value={draft.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {canChooseBranch && (
                <div className="space-y-2">
                  <Label htmlFor="new-branch">Branch</Label>
                  <Select value={draft.branchId} onValueChange={(value) => setDraft({ ...draft, branchId: value })}>
                    <SelectTrigger id="new-branch" aria-label="Branch for the new user">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent searchable searchPlaceholder="Search centre…">
                      <SelectItem value="none">Head office (no branch)</SelectItem>
                      {branchOptions.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Scope is what a role means in practice: a receptionist
                      posted to a branch sees that branch, and one posted to head
                      office sees the organisation. */}
                  <p className="text-xs text-muted-foreground">
                    Decides what they can see once they sign in.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdding(false)} disabled={creating}>
                Cancel
              </Button>
              <Button onClick={create} disabled={creating}>
                {creating ? "Creating…" : "Create user"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View */}
        <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User details</DialogTitle>
              <DialogDescription>The login as it is recorded on the institute</DialogDescription>
            </DialogHeader>
            {viewing && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Full name", viewing.name || "—"],
                    ["Login type", pretty(viewing.userType)],
                    ["Email", viewing.email || "—"],
                    ["Phone", viewing.phone || "—"],
                    ["Role", pretty(viewing.role)],
                    ["Branch / organisation", viewing.branch || viewing.organization || "—"],
                    ["Status", viewing.isActive ? "Active" : "Inactive"],
                    ["Last login", formatDate(viewing.lastLoginAt)],
                    ["Account created", formatDate(viewing.createdAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>
                      <p className="break-all text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewing(null)}>
                Close
              </Button>
              {viewing && <Button onClick={() => { openEdit(viewing); setViewing(null); }}>Edit</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
              <DialogDescription>Changes are written to the user record straight away</DialogDescription>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full name</Label>
                    <Input
                      id="edit-name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    {offeredRoles.length > 0 ? (
                      <Select
                        value={form.roleId}
                        onValueChange={(value) => setForm({ ...form, roleId: value })}
                      >
                        <SelectTrigger id="edit-role" aria-label="Role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Nobody is forced into one: a login left without a
                              role falls back to its level's built-in menu. */}
                          <SelectItem value="none">No role of its own</SelectItem>
                          {ownRoles.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Your roles</SelectLabel>
                              {ownRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {builtInRoles.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Built in</SelectLabel>
                              {builtInRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                    <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                      <SelectTrigger id="edit-role" aria-label="Role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {SYSTEM_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {pretty(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={form.isActive ? "active" : "inactive"}
                      onValueChange={(value) => setForm({ ...form, isActive: value === "active" })}
                    >
                      <SelectTrigger id="edit-status" aria-label="Status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-xs font-semibold uppercase text-muted-foreground">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    autoComplete="off"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                  {/* The email is the credential the account signs in with, so it
                      is changed on the Auth account, through the server. */}
                  <p className="text-xs text-muted-foreground">
                    This is the email they sign in with. A new one works straight away and is confirmed for them.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Password</Label>
                  {!changePassword ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        The current password cannot be shown — only a new one can be set.
                      </p>
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setChangePassword(true)}>
                        <KeyRound className="h-4 w-4" />
                        Set a new password
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            aria-label="New password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setNewPassword(generatePassword());
                            // Shown, so it can be read out to the user.
                            setShowPassword(true);
                          }}
                        >
                          Generate
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          They sign in with this from now on. Tell them what it is — it is not shown again.
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setChangePassword(false);
                            setNewPassword("");
                          }}
                        >
                          Keep current
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this user?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete?.name || pendingDelete?.email} will no longer be listed as a user of the institute
                and will be marked inactive. The sign-in account itself is revoked from the branch page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Remove user</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default AllUsers;
