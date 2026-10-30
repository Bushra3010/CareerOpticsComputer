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
import { Settings, Bell, Shield, Palette, Save, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATIONS = [
  { key: "email", title: "Email Notifications", description: "Receive email notifications for important updates" },
  { key: "sms", title: "SMS Alerts", description: "Get SMS alerts for fee reminders and announcements" },
  { key: "push", title: "Push Notifications", description: "Browser push notifications for real-time updates" },
  { key: "fees", title: "Fee Reminders", description: "Automatic reminders for pending fee payments" },
  { key: "exams", title: "Exam Notifications", description: "Alerts for upcoming exams and results" },
  { key: "attendance", title: "Attendance Alerts", description: "Notifications for low attendance" },
];

const DEFAULTS = {
  schoolName: "",
  schoolCode: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  academicYear: "",
  timezone: "ist",
  currency: "inr",
  dateFormat: "dd-mm-yyyy",
  notifications: Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, true])) as Record<string, boolean>,
  twoFactor: false,
  sessionTimeout: "30",
  passwordPolicy: true,
  accentColor: "bg-blue-500",
  compact: false,
};

const STORAGE_KEY = "erp-settings-general";

export default function GeneralSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState<Record<string, any>>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* use defaults */ }
  }, []);

  const persist = (next: Record<string, any>) => {
    setForm(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* quota */ }
  };

  const set = <K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K]) =>
    persist({ ...form, [key]: value });

  const save = () => {
    toast({ title: "Settings saved", description: "Your changes are stored on this device." });
  };
  const resetAll = () => {
    persist(DEFAULTS);
    setTheme("light");
    toast({ title: "Settings restored", description: "Every field is back to its default." });
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
                  <Select value={form.academicYear} onValueChange={(v) => set("academicYear", v)}>
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
                  <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
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
                  <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
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
                  <Select value={form.dateFormat} onValueChange={(v) => set("dateFormat", v)}>
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
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
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
                  <Switch
                    checked={form.notifications[item.key] ?? false}
                    onCheckedChange={(checked) =>
                      set("notifications", { ...form.notifications, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
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
                <Switch checked={form.twoFactor} onCheckedChange={(v) => set("twoFactor", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                </div>
                <Select value={form.sessionTimeout} onValueChange={(v) => set("sessionTimeout", v)}>
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
                <Switch checked={form.passwordPolicy} onCheckedChange={(v) => set("passwordPolicy", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Switch checked={form.compact} onCheckedChange={(v) => set("compact", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" className="gap-2" onClick={resetAll}>
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button className="gap-2" onClick={save}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </AppLayout>
  );
}
