import { useCallback, useEffect, useState } from "react";
import { Eye, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/student/StudentDocuments";
import { useToast } from "@/hooks/use-toast";
import { pickImage } from "@/lib/export";
import { branchDocuments, storedFile, type BranchDocumentSlot, type BranchRecord } from "@/lib/branchDocuments";
import { getBranchDetails, saveBranchDocument } from "@/lib/supabase/data";
import type { StudentFile } from "@/lib/studentDocuments";

/**
 * A centre's registration documents -- mohar, photos, status document, logo
 * and the director's photo, signature and Aadhaar -- each with a preview and
 * View (full size, with Download), the way a student's documents are shown.
 * With `canUpload`, a missing one can be put on file and any replaced, so a
 * centre registered before uploads were kept can be completed.
 */
export function BranchDocuments({
  branchId,
  organizationId,
  branchName,
  canUpload = false,
}: {
  branchId: string;
  organizationId: string;
  branchName: string;
  canUpload?: boolean;
}) {
  const { toast } = useToast();
  const [record, setRecord] = useState<BranchRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [open, setOpen] = useState<StudentFile | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getBranchDetails(organizationId, branchId);
      setRecord(data as BranchRecord);
    } catch (error) {
      toast({ title: "Could not load the documents", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, organizationId, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (slot: BranchDocumentSlot) => {
    const picked = await pickImage(slot.accept);
    if (picked === "too-large") {
      toast({ title: "File too large", description: "Pick a file under 5 MB.", variant: "destructive" });
      return;
    }
    if (!picked) return;
    setSaving(slot.key);
    try {
      await saveBranchDocument(branchId, slot, storedFile(picked));
      toast({ title: `${slot.label} saved` });
      await load();
    } catch (error) {
      toast({ title: `Could not save ${slot.label}`, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const docs = branchDocuments(record);
  const onFile = docs.filter((d) => d.file).length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {onFile} of {docs.length} documents on file{onFile < docs.length && canUpload ? " — upload the missing ones below." : "."}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {docs.map(({ slot, file }) => (
          <div key={slot.key} className="overflow-hidden rounded-xl border bg-card">
            {file ? (
              <button type="button" className="block h-24 w-full bg-muted/40" onClick={() => setOpen(file)} aria-label={`Open ${slot.label}`}>
                {file.kind === "image" ? (
                  <img src={file.url} alt={slot.label} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-muted-foreground"><FileText className="h-8 w-8" /></span>
                )}
              </button>
            ) : (
              <div className="flex h-24 items-center justify-center bg-muted/30 text-xs text-muted-foreground">Not uploaded</div>
            )}
            <div className="space-y-1 p-2">
              <p className="truncate text-xs font-semibold" title={slot.label}>{slot.label}</p>
              <div className="flex gap-1">
                {file && (
                  <Button type="button" size="sm" variant="outline" className="h-7 flex-1 px-2 text-xs" onClick={() => setOpen(file)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />View
                  </Button>
                )}
                {canUpload && (
                  <Button
                    type="button"
                    size="sm"
                    variant={file ? "ghost" : "outline"}
                    className="h-7 flex-1 px-2 text-xs"
                    disabled={!!saving}
                    onClick={() => void upload(slot)}
                    aria-label={`${file ? "Replace" : "Upload"} ${slot.label}`}
                  >
                    {saving === slot.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Upload className="mr-1 h-3.5 w-3.5" />{file ? "Replace" : "Upload"}</>}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <DocumentViewer file={open} studentName={branchName} onClose={() => setOpen(null)} />
    </div>
  );
}
