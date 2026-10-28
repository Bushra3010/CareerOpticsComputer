import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { viewForRole } from "@/lib/roles";
import { getUserModules } from "@/lib/supabase/data";
import { allows, type Action, type Permissions } from "@/lib/permissions";
import { permissionsForView } from "@/lib/navigation";
import { PermissionsContext } from "./PermissionsContext";

type User = { id: string; name: string; email: string; role: string; organizationId?: string; branchId?: string };

type Auth = {
  user: User | null;
  branchId: string | null;
  organizationId: string | null;
  view: "admin" | "franchise" | "student";
  /** Pages this person's role grants. Empty means everything their view allows. */
  allowedPaths: string[];
  /** What the role may do on each page beyond opening it; a page with no entry keeps every action. */
  permissions: Permissions;
  /** Whether the role may perform this action on this page. */
  can: (action: Action, path: string) => boolean;
  /** The centre an organisation admin is working as ("Login as center"), if any. */
  actingAs: ActingAs | null;
  /** Work as a centre, or pass null to return to the organisation's own view. */
  actAsCentre: (centre: ActingAs | null) => void;
  /** The view the signed-in account itself has, whoever it is acting as. */
  realView: "admin" | "franchise" | "student";
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

/**
 * Whom an office account is viewing the app as. A centre (organisation admin
 * only) gives the franchise view of that branch. A student (`studentId`, set
 * by an organisation or branch account) gives that student's own portal.
 */
export type ActingAs = { branchId: string; name: string; studentId?: string };

const ACTING_KEY = "erp-acting-as";
const readActing = (): ActingAs | null => {
  try {
    const raw = sessionStorage.getItem(ACTING_KEY);
    return raw ? (JSON.parse(raw) as ActingAs) : null;
  } catch {
    return null;
  }
};

const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(true);

  const realView = viewForRole(user?.role);
  /*
   * "Login as center": an organisation admin opens a centre's own panel
   * without its password. It stays the admin's session. The branch is narrowed
   * on the client and the view becomes the franchise one, and the admin's own
   * row-level access already covers every centre in the organisation. Kept
   * for this tab only.
   */
  const [acting, setActing] = useState<ActingAs | null>(readActing);
  const actingAs =
    acting && (realView === "admin" || (realView === "franchise" && acting.studentId)) ? acting : null;
  const view = actingAs ? (actingAs.studentId ? "student" : "franchise") : realView;
  const actAsCentre = (centre: ActingAs | null) => {
    try {
      if (centre) sessionStorage.setItem(ACTING_KEY, JSON.stringify(centre));
      else sessionStorage.removeItem(ACTING_KEY);
    } catch {
      /* storage blocked: the switch still holds until reload */
    }
    setActing(centre);
  };
  // As a student, `id` becomes the student record's id: every portal query
  // resolves its student by login id or by record id.
  const effectiveUser =
    user && actingAs
      ? actingAs.studentId
        ? { ...user, id: actingAs.studentId, name: actingAs.name, role: "STUDENT", branchId: actingAs.branchId }
        : { ...user, branchId: actingAs.branchId }
      : user;

  useEffect(() => {
    // Restore the last known account so a reload paints the app immediately
    // instead of a spinner, then let Supabase confirm or replace it below.
    // Guarded: a corrupt "erp-user" (a half-written value, or the literal
    // string "undefined") used to throw here, and an exception inside this
    // effect white-screens the whole app rather than just failing to restore.
    try {
      const saved = localStorage.getItem("erp-user");
      if (saved && saved !== "undefined") setUser(JSON.parse(saved) as User);
    } catch {
      localStorage.removeItem("erp-user");
    }

    // `loading` gates every protected route, and it used to be cleared *only*
    // from the auth callback below. If that callback never fired - offline, a
    // blocked request, a misconfigured URL - the app sat on the loading spinner
    // forever with no way out. Settle it from an explicit session read too.
    let active = true;
    supabase.auth
      .getSession()
      .catch(() => null)
      .finally(() => { if (active) setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const u: User = {
          id: session.user.id,
          name: meta.name || session.user.email || "",
          email: session.user.email || "",
          role: meta.role || "STAFF",
          organizationId: meta.organizationId || null,
          branchId: meta.branchId || null,
        };
        setUser(u);
        localStorage.setItem("erp-user", JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem("erp-user");
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * The role's own menu, re-read whenever the account changes. It is not in the
   * token on purpose -- an administrator narrowing a role should not have to
   * wait for everyone to sign in again.
   */
  useEffect(() => {
    if (!user?.id) {
      setAllowedPaths([]);
      setRolePermissions({});
      return;
    }
    let live = true;
    const refresh = () =>
      getUserModules(user.id, { role: user.role, organizationId: user.organizationId ?? null })
        .then((result) => {
          if (!live) return;
          setAllowedPaths(result.data);
          setRolePermissions(result.permissions ?? {});
        })
        // A database without roles.sql grants the view's whole menu, as before.
        .catch(() => {
          if (!live) return;
          setAllowedPaths([]);
          setRolePermissions({});
        });
    refresh();
    // An administrator can change the role while this person is signed in, so
    // the menu is re-read when the tab comes back and once a minute, rather
    // than only at sign-in.
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      live = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [user?.id, user?.role, user?.organizationId]);

  const login = async (identifier: string, password: string) => {
    const email = identifier.includes("@") ? identifier : `${identifier}@careeroptics.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    actAsCentre(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  // A sibling path (`/student/add`) keeps the actions ticked for its page.
  const pagePermissions = permissionsForView(view, rolePermissions, allowedPaths);

  return (
    <Context.Provider
      value={{
        user: effectiveUser,
        branchId: effectiveUser?.branchId || null,
        organizationId: user?.organizationId || null,
        view,
        realView,
        actingAs,
        actAsCentre,
        // A centre is shown its whole franchise menu, not the admin role's pages.
        allowedPaths: actingAs ? [] : allowedPaths,
        // Working as a centre, the head office keeps every action there too.
        permissions: actingAs ? {} : pagePermissions,
        can: (action: Action, path: string) => (actingAs ? true : allows(pagePermissions, path, action)),
        login,
        logout,
        loading,
      }}
    >
      <PermissionsContext.Provider value={actingAs ? null : pagePermissions}>{children}</PermissionsContext.Provider>
    </Context.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider missing");
  return value;
};
