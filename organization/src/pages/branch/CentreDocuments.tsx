import { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { loadInstituteName } from "@/lib/instituteName";
import {
  printStandardCentreCertificate,
  standardCentreCertificateHtml,
  type BranchDetails,
} from "@/lib/branchTemplateDocument";
import { getBranchDetails, getBranches } from "@/lib/supabase/data";

/**
 * The centre certificate: the office's statement that a branch is an
 * authorised study centre. A branch sees its own; the office picks a branch.
 */
export default function CentreDocuments() {
  const { user, view } = useAuth();
  const { toast } = useToast();
  const organizationId = user?.organizationId ?? null;
  const isBranch = view === "franchise";
  const ownBranch = isBranch ? user?.branchId ?? null : null;

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [picked, setPicked] = useState("");
  const branchId = isBranch ? ownBranch : picked || null;

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<{ branch: BranchDetails; institute: string } | null>(null);

  useEffect(() => {
    if (isBranch) return;
    getBranches(organizationId)
      .then((r) => setBranches((r.data ?? []) as Array<{ id: string; name: string }>))
      .catch(() => setBranches([]));
  }, [isBranch, organizationId]);

  useEffect(() => {
    if (!branchId || !organizationId) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getBranchDetails(organizationId, branchId).then((r) => r.data as BranchDetails),
      loadInstituteName(branchId),
    ])
      .then(([branch, institute]) => {
        if (!cancelled) setDetails({ branch, institute });
      })
      .catch((error) => {
        if (cancelled) return;
        setDetails(null);
        toast({
          title: "Could not load the certificate",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [branchId, organizationId, toast]);

  const print = () => {
    if (!details) return;
    try {
      printStandardCentreCertificate(details.branch, details.institute);
    } catch (error) {
      toast({
        title: "Could not print the certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Centre Certificate"
        description="The certificate that names this branch an authorised study centre. Download saves it as PDF from the print dialog."
        breadcrumbs={[{ label: "Certificate & Marksheet" }, { label: "Centre Certificate" }]}
        actions={
          <Button className="gap-2" onClick={print} disabled={loading || !details}>
            <Printer className="h-4 w-4" />
            Print certificate
          </Button>
        }
      />

      <div className="space-y-4">
        {!isBranch && (
          <Card>
            <CardContent className="pt-6">
              <div className="w-full max-w-sm space-y-2">
                <Label>Branch</Label>
                <Select value={picked} onValueChange={setPicked}>
                  <SelectTrigger aria-label="Branch">
                    <SelectValue placeholder="Choose a branch" />
                  </SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Search centre…">
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !branchId ? (
          <p className="text-sm text-muted-foreground">
            {isBranch
              ? "Your account is not attached to a branch. Sign out and back in, then try again."
              : "Choose a branch to see its certificate."}
          </p>
        ) : details ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Centre certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="overflow-hidden rounded-lg border bg-white p-4 text-black"
                // standardCentreCertificateHtml escapes every value it writes.
                dangerouslySetInnerHTML={{ __html: standardCentreCertificateHtml(details.branch, details.institute) }}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
