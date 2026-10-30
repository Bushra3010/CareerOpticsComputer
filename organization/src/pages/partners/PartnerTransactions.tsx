import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  partnerId: string;
  partnerName: string;
  type: "commission" | "payment" | "refund" | "adjustment";
  amount: number;
  status: "completed" | "pending" | "failed";
  description: string;
  date: string;
  referenceId: string;
  paymentMethod?: string;
}

/** `YYYY-MM-DD`, `days` before today — fixtures must stay near "now" or the
 *  date filters open on an empty table. */
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

// Sample data - replace with actual API data
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    partnerId: "1",
    partnerName: "John Education Services",
    type: "commission",
    amount: 5000,
    status: "completed",
    description: "Commission for student admission - new batch",
    date: daysAgo(4),
    referenceId: "COMM-2024-001",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "2",
    partnerId: "1",
    partnerName: "John Education Services",
    type: "payment",
    amount: 10000,
    status: "completed",
    description: "Partner incentive payment",
    date: daysAgo(9),
    referenceId: "PAY-2024-045",
    paymentMethod: "UPI",
  },
  {
    id: "3",
    partnerId: "1",
    partnerName: "John Education Services",
    type: "commission",
    amount: 3500,
    status: "pending",
    description: "Commission for online course enrollment",
    date: daysAgo(1),
    referenceId: "COMM-2024-002",
  },
  {
    id: "4",
    partnerId: "1",
    partnerName: "John Education Services",
    type: "refund",
    amount: 2000,
    status: "completed",
    description: "Refund for cancelled admission",
    date: daysAgo(14),
    referenceId: "REF-2024-012",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "5",
    partnerId: "1",
    partnerName: "John Education Services",
    type: "adjustment",
    amount: 500,
    status: "completed",
    description: "Tax adjustment for last month",
    date: daysAgo(21),
    referenceId: "ADJ-2024-003",
  },
  {
    id: "6",
    partnerId: "2",
    partnerName: "Bright Future Consultants",
    type: "commission",
    amount: 7250,
    status: "pending",
    description: "Commission for corporate training referrals",
    date: daysAgo(33),
    referenceId: "COMM-2024-003",
    paymentMethod: "Cheque",
  },
  {
    id: "7",
    partnerId: "2",
    partnerName: "Bright Future Consultants",
    type: "payment",
    amount: 4200,
    status: "failed",
    description: "Quarterly settlement - retry pending",
    date: daysAgo(47),
    referenceId: "PAY-2024-046",
    paymentMethod: "Bank Transfer",
  },
];

const PAYMENT_METHODS = ["Bank Transfer", "UPI", "Cheque"];

const BLANK_FILTERS = { from: "", to: "", min: "", max: "", method: "all" };

const PartnerTransactions = () => {
  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  /** Everything behind the "More Filters" popover. */
  const [more, setMore] = useState(BLANK_FILTERS);

  const setFilter = <K extends keyof typeof BLANK_FILTERS>(
    key: K,
    value: (typeof BLANK_FILTERS)[K],
  ) => setMore((f) => ({ ...f, [key]: value }));

  const activeCount =
    (more.from ? 1 : 0) +
    (more.to ? 1 : 0) +
    (more.min ? 1 : 0) +
    (more.max ? 1 : 0) +
    (more.method === "all" ? 0 : 1);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterStatus !== "all" && transaction.status !== filterStatus) return false;
    if (more.from && transaction.date < more.from) return false;
    if (more.to && transaction.date > more.to) return false;
    if (more.min && transaction.amount < Number(more.min)) return false;
    if (more.max && transaction.amount > Number(more.max)) return false;
    if (more.method !== "all" && (transaction.paymentMethod ?? "") !== more.method) return false;
    return true;
  });

  // Calculate summary — over what the filters currently show
  const totalCommission = filteredTransactions
    .filter((t) => t.type === "commission")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayment = filteredTransactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefund = filteredTransactions
    .filter((t) => t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalCommission + totalPayment - totalRefund;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "commission":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-blue-100 text-blue-800";
      case "refund":
        return "bg-red-100 text-red-800";
      case "adjustment":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "date" as keyof Transaction,
      header: "Date",
      cell: (item: Transaction) => format(new Date(item.date), "dd MMM yyyy"),
    },
    {
      key: "referenceId" as keyof Transaction,
      header: "Reference ID",
    },
    {
      key: "type" as keyof Transaction,
      header: "Type",
      cell: (item: Transaction) => (
        <Badge className={getTypeColor(item.type)}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "description" as keyof Transaction,
      header: "Description",
    },
    {
      key: "amount" as keyof Transaction,
      header: "Amount",
      cell: (item: Transaction) => (
        <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "status" as keyof Transaction,
      header: "Status",
      cell: (item: Transaction) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "paymentMethod" as keyof Transaction,
      header: "Payment Method",
      cell: (item: Transaction) => item.paymentMethod || "-",
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="Partner Transactions"
          description="View and manage partner financial transactions"
          breadcrumbs={[
            { label: "Partners", href: "/partners/all" },
            { label: "Transactions" },
          ]}
        />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From all commission transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total payments made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRefund.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total refunds processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Commission + Payments - Refunds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="commission">Commission</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="refund">Refund</TabsTrigger>
                <TabsTrigger value="adjustment">Adjustment</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      More Filters
                      {activeCount > 0 && (
                        <Badge className="ml-2 h-5 px-1.5" variant="secondary">
                          {activeCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="from">From date</Label>
                        <DatePicker value={more.from} onChange={(v) => setFilter("from", v)} id="from" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="to">To date</Label>
                        <DatePicker value={more.to} onChange={(v) => setFilter("to", v)} id="to" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="min">Min amount</Label>
                        <Input
                          id="min"
                          type="number"
                          placeholder="0"
                          value={more.min}
                          onChange={(e) => setFilter("min", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="max">Max amount</Label>
                        <Input
                          id="max"
                          type="number"
                          placeholder="Any"
                          value={more.max}
                          onChange={(e) => setFilter("max", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Payment method</Label>
                      <Select value={more.method} onValueChange={(v) => setFilter("method", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any method</SelectItem>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-muted-foreground">
                        {filteredTransactions.length} of {transactions.length} shown
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMore(BLANK_FILTERS)}
                        disabled={activeCount === 0}
                      >
                        Reset
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredTransactions}
                searchable={false}
                emptyMessage="No transactions found"
              />
            </TabsContent>

            <TabsContent value="commission" className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredTransactions.filter((t) => t.type === "commission")}
                searchable={false}
                emptyMessage="No commission transactions found"
              />
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredTransactions.filter((t) => t.type === "payment")}
                searchable={false}
                emptyMessage="No payment transactions found"
              />
            </TabsContent>

            <TabsContent value="refund" className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredTransactions.filter((t) => t.type === "refund")}
                searchable={false}
                emptyMessage="No refund transactions found"
              />
            </TabsContent>

            <TabsContent value="adjustment" className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredTransactions.filter((t) => t.type === "adjustment")}
                searchable={false}
                emptyMessage="No adjustment transactions found"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
};

export default PartnerTransactions;
