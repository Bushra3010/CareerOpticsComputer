import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Settings, Bell, Shield, Palette, Save, RotateCcw, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_GENERAL_SETTINGS as DEFAULTS,
  type GeneralSettings as SettingsValues,
  clearLegacySettings,
  getOrgSettings,
  readLegacySettings,
  saveOrgSettings,
} from "@/lib/supabase/orgSettings";

const NOTIFICATIONS = [
  { key: "email", title: "Email Notifications", description: "Receive email notifications for important updates" },
  { key: "sms", title: "SMS Alerts", description: "Get SMS alerts for fee reminders and announcements" },
  { key: "push", title: "Push Notifications", description: "Browser push notifications for real-time updates" },
  { key: "fees", title: "Fee Reminders", description: "Automatic reminders for pending fee payments" },
  { key: "exams", title: "Exam Notifications", description: "Alerts for upcoming exams and results" },
  { key: "attendance", title: "Attendance Alerts", description: "Notifications for low attendance" },
];

// Mirrors public.is_org_admin(): the database refuses anyone else's update,
// so the page does not offer them a Save that would fail.
const ADMIN_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];

/** Drops blank strings, so an empty field in the old browser copy does not
 *  wipe a value the organisation already has. */
const withoutBlanks = (values: Partial<SettingsValues>) =>
  Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && v !== null && v !== undefined));

export default function GeneralSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, organizationId } = useAuth();
  const canEdit = !!organizationId && ADMIN_ROLES.includes((user?.role ?? "").toUpperCase());
  const [form, setForm] = useState<SettingsValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  /** The browser's old copy was folded in and is cleared after the first save. */
  const [usedLegacy, setUsedLegacy] = useState(false);
  const locked = !canEdit || loading;

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getOrgSettings(organizationId)
      .then(({ settings, isEmpty }) => {
        if (cancelled) return;
        const legacy = isEmpty ? readLegacySettings() : null;
        if (legacy) {
          const clean = withoutBlanks(legacy) as Partial<SettingsValues>;
          setForm({
            ...settings,
            ...clean,
            notifications: { ...settings.notifications, ...(clean.notifications ?? {}) },
          });
          setUsedLegacy(true);
        } else {
          setForm(settings);
        }
      })
      .catch((err: Error) => {
        if (cancelled) return;
        toast({ title: "Could not load settings", description: err.message, variant: "destructive" });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [organizationId, toast]);

  const set = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!organizationId || !canEdit) return;
    setSaving(true);
    try {
      await saveOrgSettings(organizationId, form);
      if (usedLegacy) {
        clearLegacySettings();
        setUsedLegacy(false);
      }
      toast({ title: "Settings saved", description: "Saved for the whole organisation." });
    } catch (err) {
      toast({
        title: "Settings not saved",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const resetAll = () => {
    setForm(DEFAULTS);
    toast({ title: "Defaults restored", description: "Press Save Changes to apply them to the organisation." });
  };

  return (
    <AppLayout>
      <PageHeader
        title="General Settings"
        description="Configure your school ERP system settings"
        breadcrumbs={[
          { label: "System Settings", href: "/settings/general" },
          { label: "General Settings" },
        ]}
      />

      {!organizationId ? (
        <p className="mb-4 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          This account is not linked to an organisation, so there are no settings to show.
        </p>
      ) : !canEdit ? (
        <p className="mb-4 flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          These settings apply to the whole organisation. Only an organisation admin can change them.
        </p>
      ) : null}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <fieldset disabled={locked} className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input id="schoolName" value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input id="schoolCode" value={form.schoolCode} onChange={(e) => set("schoolCode", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Current Academic Year</Label>
                  <Select disabled={locked} value={form.academicYear} onValueChange={(v) => set("academicYear", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023-24</SelectItem>
                      <SelectItem value="2024">2024-25</SelectItem>
                      <SelectItem value="2025">2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select disabled={locked} value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select disabled={locked} value={form.currency} onValueChange={(v) => set("currency", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select disabled={locked} value={form.dateFormat} onValueChange={(v) => set("dateFormat", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          </fieldset>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <fieldset disabled={locked} className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {NOTIFICATIONS.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch disabled={locked}
                    checked={form.notifications[item.key] ?? false}
                    onCheckedChange={(checked) =>
                      set("notifications", { ...form.notifications, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          </fieldset>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <fieldset disabled={locked} className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch disabled={locked} checked={form.twoFactor} onCheckedChange={(v) => set("twoFactor", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                </div>
                <Select disabled={locked} value={form.sessionTimeout} onValueChange={(v) => set("sessionTimeout", v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password Policy</p>
                  <p className="text-sm text-muted-foreground">Require strong passwords</p>
                </div>
                <Switch disabled={locked} checked={form.passwordPolicy} onCheckedChange={(v) => set("passwordPolicy", v)} />
              </div>
            </CardContent>
          </Card>
          </fieldset>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* The theme is this person's own choice on this device, not an
                  organisation setting, so it stays usable for everyone. */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  {(["light", "dark"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={theme === mode ? "default" : "outline"}
                      className="flex-1 capitalize"
                      onClick={() => setTheme(mode)}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
              <fieldset disabled={locked} className="min-w-0 space-y-6">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  {["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-green-500", "bg-orange-500"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={color.replace("bg-", "").replace("-500", "")}
                      aria-pressed={form.accentColor === color}
                      onClick={() => set("accentColor", color)}
                      className={`h-8 w-8 rounded-full ${color} ring-2 ring-offset-2 transition-all hover:ring-primary ${
                        form.accentColor === color ? "ring-primary" : "ring-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <Switch disabled={locked} checked={form.compact} onCheckedChange={(v) => set("compact", v)} />
              </div>
              </fieldset>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canEdit && (
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" className="gap-2" onClick={resetAll} disabled={loading || saving}>
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button className="gap-2" onClick={save} disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
