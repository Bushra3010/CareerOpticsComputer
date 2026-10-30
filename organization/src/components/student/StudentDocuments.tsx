import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadName, studentFiles, toObjectUrl, type StudentFile } from "@/lib/studentDocuments";

/**
 * The documents a student has uploaded, each with a preview, View (full size,
 * images and PDFs) and Download. Used wherever the office looks at a student:
 * the student register, the online admission list and the admission form.
 */
export function StudentDocuments({
  record,
  files: given,
  studentName = "student",
  emptyText = "No documents uploaded yet.",
}: {
  record?: Record<string, unknown> | null;
  files?: StudentFile[];
  studentName?: string;
  emptyText?: string;
}) {
  const files = useMemo(() => given ?? studentFiles(record), [given, record]);
  const [open, setOpen] = useState<StudentFile | null>(null);

  if (!files.length) return <p className="text-sm text-muted-foreground">{emptyText}</p>;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {files.map((file) => (
          <div key={file.key} className="overflow-hidden rounded-xl border bg-card">
            <button
              type="button"
              className="block h-24 w-full bg-muted/40"
              onClick={() => setOpen(file)}
              aria-label={`Open ${file.label}`}
            >
              {file.kind === "image" ? (
                <img src={file.url} alt={file.label} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-muted-foreground">
                  {file.kind === "pdf" ? <FileText className="h-8 w-8" /> : <FileWarning className="h-8 w-8" />}
                </span>
              )}
            </button>
            <div className="space-y-1 p-2">
              <p className="truncate text-xs font-semibold" title={file.label}>{file.label}</p>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="outline" className="h-7 flex-1 px-2 text-xs" onClick={() => setOpen(file)}>
                  <Eye className="mr-1 h-3.5 w-3.5" />View
                </Button>
                <DownloadLink file={file} studentName={studentName} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <DocumentViewer file={open} studentName={studentName} onClose={() => setOpen(null)} />
    </>
  );
}

/** One document full size, with Download; closed while `file` is null. */
export function DocumentViewer({
  file,
  studentName = "student",
  onClose,
}: {
  file: StudentFile | null;
  studentName?: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!file} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{file?.label}</DialogTitle>
          <DialogDescription>
            {file?.name || studentName}
            {file?.uploadedAt ? ` · uploaded ${new Date(file.uploadedAt).toLocaleDateString("en-IN")}` : ""}
          </DialogDescription>
        </DialogHeader>
        {file && <Preview file={file} />}
        {file && (
          <div className="flex justify-end">
            <DownloadLink file={file} studentName={studentName} wide />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Images inline; a PDF in a frame through a blob URL, which browsers allow. */
function Preview({ file }: { file: StudentFile }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (file.kind !== "pdf") return setSrc(file.url);
    let made = "";
    try {
      made = toObjectUrl(file.url);
      setSrc(made);
    } catch {
      setSrc("");
    }
    return () => {
      if (made.startsWith("blob:")) URL.revokeObjectURL(made);
    };
  }, [file]);

  if (file.kind === "image") {
    return <img src={file.url} alt={file.label} className="max-h-[70vh] w-full rounded-lg object-contain" />;
  }
  if (file.kind === "pdf" && src) {
    return <iframe src={src} title={file.label} className="h-[70vh] w-full rounded-lg border" />;
  }
  return <p className="py-10 text-center text-sm text-muted-foreground">This file cannot be previewed here. Download it to open.</p>;
}

function DownloadLink({ file, studentName, wide = false }: { file: StudentFile; studentName: string; wide?: boolean }) {
  const save = () => {
    const url = toObjectUrl(file.url);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName(file, studentName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (url.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  return (
    <Button
      type="button"
      size="sm"
      variant={wide ? "default" : "ghost"}
      className={wide ? "" : "h-7 px-2"}
      onClick={save}
      aria-label={`Download ${file.label}`}
      data-perm="print"
    >
      <Download className={wide ? "mr-1.5 h-4 w-4" : "h-3.5 w-3.5"} />
      {wide && "Download"}
    </Button>
  );
}
