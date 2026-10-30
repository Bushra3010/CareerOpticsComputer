import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGuard } from "./PermissionGuard";
import { ClassicShell } from "./ClassicShell";
import { loadInstituteLogo } from "@/lib/instituteLogo";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, actingAs, actAsCentre } = useAuth();
  const navigate = useNavigate();

  // The PDF builders are synchronous and cannot fetch, so the branch's mark is
  // pulled into its localStorage mirror here — once per session, on whatever
  // page the user happens to open first.
  useEffect(() => {
    void loadInstituteLogo(user?.branchId ?? null);
  }, [user?.branchId]);

  // Always in sight while an admin works as a centre, with the way back.
  const banner = actingAs ? (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-gold px-4 py-1.5 text-[12.5px] font-semibold text-gold-foreground">
      <span className="truncate">Viewing as {actingAs.name}{actingAs.studentId ? " (student portal)" : ""}</span>
      <button type="button" onClick={() => { const student = !!actingAs.studentId; actAsCentre(null); navigate(student ? "/student/view" : "/"); }} className="shrink-0 rounded-full bg-white/80 px-3 py-0.5 text-xs font-bold hover:bg-white">
        {actingAs.studentId ? "Back to students" : "Back to admin"}
      </button>
    </div>
  ) : null;

  return (
    <ClassicShell banner={banner}>
      <PermissionGuard>{children}</PermissionGuard>
    </ClassicShell>
  );
}
