import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessWithRole } from "@/lib/navigation";
import NotAuthorized from "@/pages/NotAuthorized";

/**
 * Two gates: signed in at all, then authorised for this particular path.
 *
 * The session is restored asynchronously, so the first render of a hard reload
 * always has `user === null`. Redirecting on that render would bounce a signed-in
 * person to the login screen and then on to their home page — losing the page
 * they actually reloaded. Wait for `loading` to settle first, and remember where
 * they were headed so the login can return them there.
 *
 * The second gate used to be described here but never ran: `canAccess` was
 * exported and called by nothing, and `NotAuthorized` was routed from nowhere,
 * so a student who typed /branch/create got the admin screen. It now renders in
 * place — not a redirect — so the address bar still shows the path that was
 * refused and a reload does not silently land somewhere else.
 */
export function ProtectedRoute() {
  const { user, view, allowedPaths, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // The view is the outer boundary; the person's role narrows it from there.
  if (!canAccessWithRole(view, location.pathname, allowedPaths)) return <NotAuthorized />;

  return <Outlet />;
}
