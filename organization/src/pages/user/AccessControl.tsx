import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Save, Shield } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRoles, updateRole, canManageUsers, isSuperAdminRole, type RoleRow } from "@/lib/supabase/data";
import { ACTIONS, ACTION_LABELS, actionsOn, type Action, type Permissions } from "@/lib/permissions";
import { modulesForView } from "@/lib/navigation";
import { viewForRole, type View } from "@/lib/roles";

/**
 * What each role may open.
 *
 * The page used to show a fixed list of invented permissions -- "Export
 * Reports", "Delete Student" -- whose switches were wired to nothing at all.
 * These are the real pages of the app, grouped as the sidebar groups them, and
 * ticking one is what puts it in that role's menu.
 *
 * Granting is bounded by the role's own level: a branch role cannot be handed
 * an organisation page, because the database would refuse the data behind it
 * anyway. A role that was never given a list keeps the whole menu for its
 * level, which is how every account behaved before roles existed; once saved,
 * it opens exactly what is ticked -- and with nothing ticked, nothing.
 */
export default function AccessControl() {
  const { toast } = useToast();
  const { user, organizationId } = useAuth();
  const [params, setParams] = useSearchParams();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [granted, setGranted] = useState<string[]>([]);
  const [perms, setPerms] = useState<Permissions>({});

  const roleId = params.get("role") ?? "";
  const role = roles.find((r) => r.id === roleId) ?? null;
  // A Super Admin always has everything; there is nothing here to narrow.
  const superAdmin = isSuperAdminRole(role);
  const mayEdit = viewForRole(user?.role) === "admin" && canManageUsers(user?.role) && !superAdmin;

  /** The pages this role's level can reach at all — the ceiling on the ticks. */
  const groups = useMemo(
    () => (role ? modulesForView(viewForRole(role.baseRole)) : []),
    [role],
  );
  const everyPath = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => item.url)),
    [groups],
  );

  useEffect(() => {
    let live = true;
    setLoading(true);
    getRoles(organizationId)
      .then((result) => {
        if (!live) return;
        setRoles(result.data);
        if (!params.get("role") && result.data.length) {
          setParams({ role: result.data[0].id }, { replace: true });
        }
      })
      .catch((error: unknown) =>
        toast({
          title: "Could not load the roles",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
      )
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // The ticks follow whichever role is being looked at.
  useEffect(() => {
    // A role never given a list has every page; show it as every page ticked.
    // ["/"] -- the landing page alone -- is how a role with nothing ticked is stored.
    setGranted(role ? (role.modules.length && !isSuperAdminRole(role) ? role.modules.filter((url) => everyPath.includes(url)) : everyPath) : []);
    setPerms(role && !isSuperAdminRole(role) ? role.permissions : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id, role?.modules, role?.permissions]);

  const has = (url: string, action: Action) => actionsOn(perms, url).includes(action);
  /** Sets one action on some pages; a page left with every action needs no entry. */
  const setAction = (urls: string[], action: Action, on: boolean) => {
    // Allowing an action on a page means the role must be able to open it.
    if (on) setGranted((list) => [...new Set([...list, ...urls])]);
    setPerms((current) => {
      const next = { ...current };
      for (const url of urls) {
        const list = new Set(actionsOn(next, url));
        if (on) list.add(action);
        else list.delete(action);
        if (list.size === ACTIONS.length) delete next[url];
        else next[url] = ACTIONS.filter((a) => list.has(a));
      }
      return next;
    });
  };
  const viewOnly = () => {
    setGranted(everyPath);
    setPerms(Object.fromEntries(everyPath.map((url) => [url, [] as Action[]])));
  };
  const fullAccess = () => {
    setGranted(everyPath);
    setPerms({});
  };

  const toggle = (url: string, on: boolean) =>
    setGranted((list) => (on ? [...new Set([...list, url])] : list.filter((p) => p !== url)));

  const toggleGroup = (urls: string[], on: boolean) =>
    setGranted((list) =>
      on ? [...new Set([...list, ...urls])] : list.filter((p) => !urls.includes(p)),
    );

  const save = async () => {
    if (!role) return;
    setSaving(true);
    try {
      // Everything ticked is stored as nothing: "the whole menu" should keep
      // meaning the whole menu even after a page is added to the app later.
      // Nothing ticked is stored as the landing page alone, not as nothing --
      // nothing would hand the role every page.
      const ticked = granted.filter((url) => everyPath.includes(url));
      const modules = ticked.length === everyPath.length ? [] : ticked.length ? ticked : ["/"];
      // Only pages the role can open carry action limits.
      const permissions = Object.fromEntries(
        Object.entries(perms).filter(([url]) => granted.includes(url) && everyPath.includes(url)),
      ) as Permissions;
      await updateRole(role.id, { modules, permissions });
      setRoles((list) => list.map((r) => (r.id === role.id ? { ...r, modules, permissions } : r)));
      toast({
        title: "Permissions saved",
        description:
          modules.length === 0
            ? `${role.name} gets every page for its level.`
            : `${role.name} gets ${ticked.length} page(s). Anyone signed in sees the change within a minute.`,
      });
    } catch (error) {
      toast({
        title: "Could not save the permissions",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Access Control"
        description="Tick what each role may do on every page: View, Add, Edit, Delete, Print, Export, Approve."
        breadcrumbs={[{ label: "User Management", href: "/user/all" }, { label: "Access Control" }]}
        actions={
          mayEdit &&
          role && (
            // Never held back by the guard: a role narrowed by mistake must
            // still be able to be put right from here.
            <Button className="gap-2" onClick={save} disabled={saving} data-perm-ignore="">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save permissions"}
            </Button>
          )
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : roles.length === 0 ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            <p className="font-medium">Roles are not set up on this database yet.</p>
            <p className="mt-1 text-muted-foreground">
              Run <code>supabase/schema/roles.sql</code> in the Supabase SQL editor. Until then
              everyone keeps the menu their built-in role has always had.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-wrap items-end gap-4 p-4">
              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="role-picker">Role</Label>
                <Select
                  value={roleId}
                  onValueChange={(value) => setParams({ role: value }, { replace: true })}
                >
                  <SelectTrigger id="role-picker">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {role && (
                <p className="text-xs text-muted-foreground">
                  {role.description || "No description"}
                  <br />
                  {`${granted.length} of ${everyPath.length} pages · ${Object.keys(perms).filter((u) => granted.includes(u)).length} with limited actions`}
                </p>
              )}
              {role && mayEdit && (
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={fullAccess}>
                    Full access
                  </Button>
                  <Button variant="outline" size="sm" onClick={viewOnly}>
                    View only
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setGranted([]); setPerms({}); }}>
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {superAdmin && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 text-sm">
                <p className="font-semibold">Super Admin has full access</p>
                <p className="mt-1 text-muted-foreground">
                  Every page and every action — including pages added to the app later. It cannot be narrowed here.
                </p>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">
            <b>View</b> puts the page in the role's menu. <b>Create</b> (add / new / save), <b>Edit</b>, <b>Delete</b>,{" "}
            <b>Print</b>, <b>Export</b> and <b>Approve</b> decide which buttons work on it — ticking any of them ticks View
            too. Tick a group's row to set every page in it.
          </p>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="p-3 text-left font-semibold">Page</th>
                    <th className="w-16 p-3 text-center font-semibold">View</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="w-16 p-3 text-center font-semibold">{ACTION_LABELS[a]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => {
                    const urls = group.items.map((item) => item.url);
                    const open = urls.filter((url) => granted.includes(url));
                    return (
                      <FragmentRows key={group.group}>
                        <tr className="border-b bg-muted/20">
                          <td className="p-2.5 pl-3 font-semibold">
                            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" />{group.group}</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <Checkbox
                              checked={urls.every((url) => granted.includes(url))}
                              disabled={!mayEdit}
                              aria-label={`View all of ${group.group}`}
                              onCheckedChange={(value) => toggleGroup(urls, value === true)}
                            />
                          </td>
                          {ACTIONS.map((a) => (
                            <td key={a} className="p-2.5 text-center">
                              <Checkbox
                                checked={open.length === urls.length && urls.every((url) => has(url, a))}
                                disabled={!mayEdit}
                                aria-label={`${ACTION_LABELS[a]} in all of ${group.group}`}
                                onCheckedChange={(value) => setAction(value === true ? urls : open, a, value === true)}
                              />
                            </td>
                          ))}
                        </tr>
                        {group.items.map((item) => {
                          const canOpen = granted.includes(item.url);
                          return (
                            <tr key={item.url} className="border-b last:border-0">
                              <td className="p-2.5 pl-9">{item.title}</td>
                              <td className="p-2.5 text-center">
                                <Checkbox
                                  checked={canOpen}
                                  disabled={!mayEdit}
                                  aria-label={`View ${item.title}`}
                                  onCheckedChange={(value) => toggle(item.url, value === true)}
                                />
                              </td>
                              {ACTIONS.map((a) => (
                                <td key={a} className="p-2.5 text-center">
                                  <Checkbox
                                    checked={canOpen && has(item.url, a)}
                                    disabled={!mayEdit}
                                    aria-label={`${ACTION_LABELS[a]} on ${item.title}`}
                                    onCheckedChange={(value) => setAction([item.url], a, value === true)}
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </FragmentRows>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {role && (
            <div className="text-xs text-muted-foreground">
              View decides the menu and the pages this role can open; the other columns decide which
              buttons work there — anything unticked is greyed out and refused with a message. The database keeps its own
              rules on top — a branch role cannot read another branch's records whatever is ticked
              here.{" "}
              <Badge variant="outline" className="ml-1">
                {role.isSystem ? "Built-in role" : "Custom role"}
              </Badge>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

/** A group heading row and its page rows, as siblings in the table body. */
function FragmentRows({ children }: { children: React.ReactNode }) {
  return <Fragment>{children}</Fragment>;
}
