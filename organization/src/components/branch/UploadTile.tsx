import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X } from "lucide-react";
import { pickImage } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

/**
 * A dashed upload slot that actually opens a file picker and previews the
 * choice. The enclosing form's `FormData` gets the file name under `name` and
 * the file itself -- { name, dataUrl, uploadedAt } as JSON -- under
 * `${name}File`, which the page saves with the record.
 */
export function UploadTile({
  label,
  hint,
  name,
  size = "sm",
  accept = "image/*",
}: {
  label: string;
  hint: string;
  name: string;
  size?: "sm" | "lg";
  /** What the picker offers: images, or "image/*,application/pdf" for papers. */
  accept?: string;
}) {
  const { toast } = useToast();
  const [file, setFile] = useState<{ name: string; dataUrl: string; uploadedAt: string } | null>(null);

  const choose = async () => {
    const picked = await pickImage(accept);
    if (picked === "too-large") {
      toast({ title: "File too large", description: "Pick a file under 5 MB.", variant: "destructive" });
      return;
    }
    if (picked) setFile({ ...picked, uploadedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className={`border-2 border-dashed border-border rounded-lg text-center ${size === "lg" ? "p-8" : "p-4"}`}>
        {file ? (
          <>
            {file.dataUrl.startsWith("data:image/") ? (
              <img src={file.dataUrl} alt={label} className="mx-auto mb-2 max-h-24 rounded object-contain" />
            ) : (
              <FileText className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            )}
            <p className="mb-2 truncate text-xs text-muted-foreground" title={file.name}>{file.name}</p>
            <div className="flex justify-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={choose}>Replace</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <>
            <Upload className={`mx-auto mb-2 text-muted-foreground ${size === "lg" ? "h-10 w-10" : "h-8 w-8"}`} />
            <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
            <Button type="button" variant="outline" size="sm" onClick={choose}>Choose File</Button>
          </>
        )}
      </div>
      <input type="hidden" name={name} value={file?.name ?? ""} />
      <input type="hidden" name={`${name}File`} value={file ? JSON.stringify(file) : ""} />
    </div>
  );
}
