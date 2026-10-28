import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UploadTile } from "./UploadTile";

/** Branch settings, keyed by the form field each switch submits. */
const settings = [
  { name: "activeStatus", label: "Active Status", hint: "Enable/disable branch", on: true },
  { name: "onlineEnrollment", label: "Online Enrollment", hint: "Accept online admissions", on: true },
  { name: "smsNotifications", label: "SMS Notifications", hint: "Send SMS alerts", on: false },
  { name: "emailNotifications", label: "Email Notifications", hint: "Send email updates", on: true },
  { name: "onlineFeePayment", label: "Online Fee Payment", hint: "Enable online fee collection", on: false },
  { name: "studentPortal", label: "Student Portal", hint: "Access to student dashboard", on: false },
  { name: "parentPortal", label: "Parent Portal", hint: "Access to parent dashboard", on: false },
];

export function BranchAdminSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branch Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadTile name="branchLogo" label="" hint="Upload branch logo — PNG, JPG up to 5MB" size="lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Branch Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminName">Admin Name *</Label>
            <Input id="adminName" name="adminName" placeholder="Branch admin name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminUsername">Admin Username *</Label>
            <Input id="adminUsername" name="adminUsername" placeholder="admin_username" />
            <p className="text-xs text-muted-foreground">
              This is the login ID the branch will sign in with.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminPassword">Admin Password *</Label>
            <Input id="adminPassword" name="adminPassword" type="password" placeholder="••••••••" />
            <p className="text-xs text-muted-foreground">At least 6 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email</Label>
            <Input id="adminEmail" name="adminEmail" type="email" placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminPhone">Admin Phone</Label>
            <Input id="adminPhone" name="adminPhone" placeholder="+91 XXXXX XXXXX" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branch Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.name} className="flex items-center justify-between">
              <div>
                <Label htmlFor={setting.name}>{setting.label}</Label>
                <p className="text-xs text-muted-foreground">{setting.hint}</p>
              </div>
              <Switch id={setting.name} name={setting.name} defaultChecked={setting.on} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
