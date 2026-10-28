import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { Switch } from "@/components/ui/switch";
import { Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSessionYears, type SessionYear } from "@/lib/supabase/data";
import { useAuth } from "@/contexts/AuthContext";

/** The three the register knows. Anything else is typed in, not filed as
 *  "Other" -- a coaching centre is worth knowing about by name. */
const instituteTypes = [
  { value: "computer", label: "Computer Institute" },
  { value: "typing", label: "Typing Institute" },
  { value: "paramedical", label: "Paramedical Institute" },
];

export function BranchInfoSection() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionYear[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const result = await getSessionYears(user?.organizationId || null);
        setSessions(result.data || []);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      }
    };
    fetchSessions();
  }, [user?.organizationId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Branch Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name *</Label>
            <Input id="branchName" name="branchName" placeholder="Enter branch name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchCode">Branch Code *</Label>
            <Input id="branchCode" name="branchCode" placeholder="e.g., BR001" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="branchType">Branch Type</Label>
            <Select name="branchType" defaultValue="sub">
              <SelectTrigger id="branchType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Branch</SelectItem>
                <SelectItem value="sub">Sub Branch</SelectItem>
                <SelectItem value="franchise">Franchise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instituteType">Institute Type *</Label>
            <SelectWithCustom
              id="instituteType"
              name="instituteType"
              options={instituteTypes}
              placeholder="Select institute type"
              customPlaceholder="Type the institute type"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <Select name="academicYear">
              <SelectTrigger id="academicYear">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.name}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="establishedYear">Established Year</Label>
            <Input id="establishedYear" name="establishedYear" type="number" placeholder="e.g., 2020" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" placeholder="https://branch.example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Brief description of the branch" rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
