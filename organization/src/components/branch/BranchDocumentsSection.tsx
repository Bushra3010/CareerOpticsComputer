import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { UploadTile } from "./UploadTile";

export function BranchDocumentsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Branch Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <UploadTile name="mohar" label="Branch Mohar (Stamp)" hint="Upload mohar/stamp" />
          <UploadTile name="branchPhoto" label="Branch Photo" hint="Upload branch photo" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <UploadTile name="labPhoto" label="Lab Photo" hint="Upload lab photo" />
          <UploadTile name="statusDocument" label="Status Document" hint="Upload status document (image or PDF)" accept="image/*,application/pdf" />
        </div>
      </CardContent>
    </Card>
  );
}
