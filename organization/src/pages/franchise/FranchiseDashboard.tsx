import { AppLayout } from "@/components/layout/AppLayout";
import { CentreHome } from "@/components/home/CentreHome";

/** A centre's dashboard: its banner, helpline, downloads and figures. */
export default function FranchiseDashboard() {
  return (
    <AppLayout>
      <CentreHome />
    </AppLayout>
  );
}
