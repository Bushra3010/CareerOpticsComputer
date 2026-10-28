import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { VIEWS } from "@/lib/roles";

/** Shown when a signed-in account opens a path outside its authorisation —
 *  named rather than silently redirected, so the reason is legible. */
export default function NotAuthorized() {
  const { user, view } = useAuth();
  const { pathname } = useLocation();
  return (
    <AppLayout>
      <div className="mx-auto max-w-xl py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive"><ShieldAlert className="h-6 w-6" /></span>
            <h1 className="text-2xl font-semibold tracking-[-.03em]">Not authorised</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{pathname}</code> is outside the {VIEWS[view].label.toLowerCase()} workspace.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              You are signed in as <span className="font-medium text-foreground">{user?.name}</span> ({user?.role.replaceAll("_", " ").toLowerCase()}). {VIEWS[view].description}
            </p>
            <Button asChild className="mt-6"><Link to={VIEWS[view].home}><ArrowLeft />Back to my dashboard</Link></Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
