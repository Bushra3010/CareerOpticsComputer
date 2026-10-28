"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface OrgSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<OrgSettings>({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("org-settings");
    if (stored) setSettings(JSON.parse(stored));
    setLoading(false);
  }, []);

  const save = () => {
    setSaving(true);
    localStorage.setItem("org-settings", JSON.stringify(settings));
    toast({ title: "Settings saved" });
    setSaving(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        description="Manage organization settings"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
        ]}
        actions={
          <Button onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">Contact Email</Label>
                <Input id="org-email" type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Contact Phone</Label>
                <Input id="org-phone" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-city">City</Label>
                <Input id="org-city" value={settings.city} onChange={e => setSettings({ ...settings, city: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="org-address">Address</Label>
                <Input id="org-address" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-state">State</Label>
                <Input id="org-state" value={settings.state} onChange={e => setSettings({ ...settings, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-pincode">Pincode</Label>
                <Input id="org-pincode" value={settings.pincode} onChange={e => setSettings({ ...settings, pincode: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Role</p>
              <p className="mt-1 text-sm">Organization Admin</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Organization</p>
              <p className="mt-1 text-sm">{settings.name || "Default"}</p>
            </div>
            <Separator />
            <Button variant="outline" className="w-full">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
