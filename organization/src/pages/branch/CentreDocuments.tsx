import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Award, Loader2, Printer } from "lucide-react";

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
import { DOCUMENT_KINDS, canvasSize, type DocumentDesign } from "@/lib/documentDesigner";
import { loadInstituteName } from "@/lib/instituteName";
import {
  branchDocumentHtml,
  branchTokens,
  loadAssignedBranchDocuments,
  printBranchDocument,
  printStandardCentreCertificate,
  standardCentreCertificateHtml,
  type BranchDetails,
  type BranchDocumentKind,
} from "@/lib/branchTemplateDocument";
import { getBranchDetails, getBranches } from "@/lib/supabase/data";

interface Ready {
  kind: BranchDocumentKind;
  name: string;
  design: DocumentDesign;
  html: string;
}

/** The designed page, shrunk to the width of its card. */
function Preview({ kind, html, design }: { kind: BranchDocumentKind; html: string; design: DocumentDesign }) {
  const { width, height } = canvasSize(kind, design);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => setScale(box.clientWidth / width);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={boxRef}
      className="relative w-full overflow-hidden rounded-lg border bg-white"
      style={{ height: height * scale }}
    >
      <div
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: "0 0" }}
        // designHtml escapes every token value it writes.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/**
 * The documents a branch holds about itself -- its centre certificate and any
 * branch award -- drawn from the template the organisation assigned it.
 *
 * The Document Designer could design and assign these, and then the branch had
 * nowhere to get them from. A branch sees its own; the office picks a branch.
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
  const [documents, setDocuments] = useState<Ready[]>([]);
  const [branchName, setBranchName] = useState("");
  const [details, setDetails] = useState<{ branch: BranchDetails; institute: string } | null>(null);

  useEffect(() => {
    if (isBranch) return;
    getBranches(organizationId)
      .then((r) => setBranches((r.data ?? []) as Array<{ id: string; name: string }>))
      .catch(() => setBranches([]));
  }, [isBranch, organizationId]);

  useEffect(() => {
    if (!branchId || !organizationId) {
      setDocuments([]);
      setDetails(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [branch, institute, assigned] = await Promise.all([
        getBranchDetails(organizationId, branchId).then((r) => r.data as BranchDetails),
        loadInstituteName(branchId),
        loadAssignedBranchDocuments(organizationId, branchId),
      ]);
      const data = branchTokens(branch, institute);
      const ready = await Promise.all(
        assigned.map(async ({ kind, template, design }) => ({
          kind,
          name: template.name,
          design,
          html: await branchDocumentHtml(kind, design, data),
        })),
      );
      if (cancelled) return;
      setBranchName(String(branch.name ?? ""));
      setDetails({ branch, institute });
      setDocuments(ready);
    })()
      .catch((error) => {
        if (cancelled) return;
        setDocuments([]);
        setDetails(null);
        toast({
          title: "Could not load the certificates",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [branchId, organizationId, toast]);

  const download = (doc: Ready) => printBranchDocument(doc.kind, `${doc.name} — ${branchName}`, doc.html, doc.design);

  const designed = documents.find((doc) => doc.kind === "centre-certificate");
  // The office prints the branch's assigned design, else the standard layout.
  const printCentre = async () => {
    if (designed) return download(designed);
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
        description="The centre certificate and awards the organisation has issued to this branch. Download saves them as PDF from the print dialog."
        breadcrumbs={[{ label: "Certificate & Marksheet" }, { label: "Centre Certificate" }]}
      />

      <div className="space-y-4">
        {!isBranch && (
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
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
              <Button className="gap-2" onClick={() => void printCentre()} disabled={loading || !details}>
                <Printer className="h-4 w-4" />
                Print centre certificate
              </Button>
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
              : "Choose a branch to see its certificates."}
          </p>
        ) : documents.length === 0 && !isBranch && details ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
              <CardTitle className="text-base">
                {DOCUMENT_KINDS["centre-certificate"].label}
                <span className="block text-xs font-normal text-muted-foreground">
                  Standard layout — no design is assigned to this branch. Assign one in the Document Designer to print it in your own design.
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="overflow-hidden rounded-lg border bg-white p-4 text-black"
                // standardCentreCertificateHtml escapes every value it writes.
                dangerouslySetInnerHTML={{ __html: standardCentreCertificateHtml(details.branch, details.institute) }}
              />
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="flex items-start gap-3 pt-6 text-sm text-muted-foreground">
              <Award className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                No centre certificate has been issued to this branch yet. The organisation designs
                it in the Document Designer and uses “Assign to branches” to issue it.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {documents.map((doc) => (
              <Card key={doc.kind}>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
                  <CardTitle className="text-base">
                    {DOCUMENT_KINDS[doc.kind].label}
                    <span className="block text-xs font-normal text-muted-foreground">{doc.name}</span>
                  </CardTitle>
                  <Button size="sm" className="gap-2" onClick={() => download(doc)}>
                    <Printer className="h-4 w-4" />
                    Print / Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <Preview kind={doc.kind} html={doc.html} design={doc.design} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
