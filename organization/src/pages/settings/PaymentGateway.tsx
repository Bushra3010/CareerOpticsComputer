import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Globe, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CONNECTED_KEY = "erp-gateways-connected";
const CONFIGS_KEY = "erp-gateway-configs";

const GATEWAYS = [
  { id: "razorpay", name: "Razorpay", description: "Accept payments via UPI, Cards, Netbanking, Wallets", logo: "🔷" },
  { id: "paytm", name: "Paytm", description: "Accept payments via Paytm Wallet, UPI, Cards", logo: "💙" },
  { id: "stripe", name: "Stripe", description: "Global payment processing for cards and wallets", logo: "💳" },
  { id: "phonepe", name: "PhonePe", description: "Accept UPI payments via PhonePe", logo: "💜" },
];

type GatewayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  testMode: boolean;
  verifyWebhooks: boolean;
};

const BLANK_CONFIG: GatewayConfig = {
  keyId: "",
  keySecret: "",
  webhookSecret: "",
  testMode: false,
  verifyWebhooks: true,
};

const PaymentGateway = () => {
  const { toast } = useToast();
  const [connected, setConnected] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, GatewayConfig>>({});
  const [active, setActive] = useState("razorpay");
  const [tab, setTab] = useState("gateways");

  const activeName = GATEWAYS.find((g) => g.id === active)?.name ?? active;
  const config = configs[active] ?? BLANK_CONFIG;

  useEffect(() => {
    try {
      const c = localStorage.getItem(CONNECTED_KEY);
      if (c) setConnected(JSON.parse(c));
      const cfg = localStorage.getItem(CONFIGS_KEY);
      if (cfg) setConfigs(JSON.parse(cfg));
    } catch { /* use empty defaults */ }
  }, []);

  const persistConnected = (next: string[]) => { setConnected(next); try { localStorage.setItem(CONNECTED_KEY, JSON.stringify(next)); } catch { } };
  // `disconnect` passes an updater, so this has to resolve it before writing -
  // `JSON.stringify(fn)` is `undefined` and would have stored the string "undefined".
  const persistConfigs = (
    next: Record<string, GatewayConfig> | ((all: Record<string, GatewayConfig>) => Record<string, GatewayConfig>),
  ) => {
    setConfigs((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(CONFIGS_KEY, JSON.stringify(value)); } catch { /* quota */ }
      return value;
    });
  };

  /**
   * Every caller is a single field's onChange - `setConfig("keyId", value)`.
   * The old one-argument signature replaced the whole gateway config with that
   * field name, so credentials could never be saved.
   */
  const setConfig = <K extends keyof GatewayConfig>(key: K, value: GatewayConfig[K]) =>
    persistConfigs((all) => ({
      ...all,
      [active]: { ...(all[active] ?? BLANK_CONFIG), [key]: value },
    }));

  const connect = (id: string, name: string) => {
    if (!connected.includes(id)) persistConnected([...connected, id]);
    setActive(id);
    setTab("settings");
    toast({ title: `${name} connected`, description: "Add your API credentials to start accepting payments." });
  };

  const disconnect = (id: string, name: string) => {
    persistConnected(connected.filter((g) => g !== id));
    persistConfigs((all) => { const next = { ...all }; delete next[id]; return next; });
    toast({ title: `${name} disconnected`, description: "Stored credentials were cleared." });
  };

  const saveConfig = () => {
    if (!config.keyId.trim() || !config.keySecret.trim()) {
      toast({ title: "Credentials required", description: "Both the API key ID and secret are needed.", variant: "destructive" });
      return;
    }
    toast({ title: "Configuration saved", description: `${activeName} credentials stored on this device.` });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payment Gateway"
          description="Configure payment gateways for fee collection"
          breadcrumbs={[
            { label: "Settings", href: "/settings/general" },
            { label: "Payment Gateway" },
          ]}
        />

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
            <TabsTrigger value="settings">Gateway Settings</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="gateways" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GATEWAYS.map((gateway) => (
                <Card key={gateway.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{gateway.logo}</div>
                        <div>
                          <CardTitle className="text-lg">{gateway.name}</CardTitle>
                          <CardDescription>{gateway.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={connected.includes(gateway.id) ? "default" : "secondary"}>
                        {connected.includes(gateway.id) ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {connected.includes(gateway.id) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActive(gateway.id);
                              setTab("settings");
                            }}
                          >
                            Configure
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => disconnect(gateway.id, gateway.name)}>
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => connect(gateway.id, gateway.name)}>Connect</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {activeName} Configuration
                </CardTitle>
                <CardDescription>
                  Configure your {activeName} API credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-id">API Key ID</Label>
                    <Input id="key-id" placeholder="rzp_live_xxxxxxxxxx" type="password" value={config.keyId} onChange={(e) => setConfig("keyId", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-secret">API Key Secret</Label>
                    <Input id="key-secret" placeholder="••••••••••••••••" type="password" value={config.keySecret} onChange={(e) => setConfig("keySecret", e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Test Mode</p>
                      <p className="text-sm text-muted-foreground">Use test credentials for development</p>
                    </div>
                  </div>
                  <Switch checked={config.testMode} onCheckedChange={(v) => setConfig("testMode", v)} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Webhook Verification</p>
                      <p className="text-sm text-muted-foreground">Verify webhook signatures for security</p>
                    </div>
                  </div>
                  <Switch checked={config.verifyWebhooks} onCheckedChange={(v) => setConfig("verifyWebhooks", v)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input id="webhook-secret" placeholder="whsec_xxxxxxxxxx" type="password" value={config.webhookSecret} onChange={(e) => setConfig("webhookSecret", e.target.value)} />
                </div>

                <Button onClick={saveConfig}>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>View payment transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Transactions will appear here once payments are processed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PaymentGateway;
