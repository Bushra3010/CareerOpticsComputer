import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, Edit, Trash2, Banknote } from "lucide-react";

interface Voucher {
  id: string;
  voucherNumber: string;
  date: string;
  headId: string;
  headName: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  bankName?: string;
  branchName?: string;
  chequeNumber?: string;
  depositedBy?: string;
  paidTo?: string;
  description?: string;
  remarks?: string;
}

const sampleExpenses: Voucher[] = [
  {
    id: "1",
    voucherNumber: "EV-2024-001",
    date: "2024-03-15",
    headId: "1",
    headName: "Salary Expense",
    amount: 45000,
    paymentMethod: "bank_transfer",
    paidTo: "Staff Member A",
    description: "Monthly salary for March 2024",
  },
  {
    id: "2",
    voucherNumber: "EV-2024-002",
    date: "2024-03-18",
    headId: "2",
    headName: "Office Rent",
    amount: 25000,
    paymentMethod: "cheque",
    paidTo: "Landlord X",
    chequeNumber: "CHQ987654",
    bankName: "SBI",
    description: "Office rent for March",
  },
];

const ExpenseVoucher = () => {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>(sampleExpenses);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Voucher>>({});

  const handleDelete = (id: string) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
    toast({
      title: "Voucher Deleted",
      description: "The expense voucher has been removed successfully.",
    });
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData(voucher);
    setIsEditModalOpen(true);
  };

  const handleView = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsViewModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setVouchers(prev =>
      prev.map(v => (v.id === formData.id ? { ...v, ...formData } as Voucher : v))
    );
    setIsEditModalOpen(false);
    toast({
      title: "Success",
      description: "Expense voucher updated successfully!",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newVoucher: Voucher = {
      ...(formData as Voucher),
      id: Math.random().toString(36).substr(2, 9),
      headName: formData.headId === "1" ? "Salary Expense" : formData.headId === "2" ? "Office Rent" : "Other Expense",
    };
    setVouchers(prev => [...prev, newVoucher]);
    setIsCreateModalOpen(false);
    setFormData({});
    toast({
      title: "Success",
      description: "Expense voucher created successfully!",
    });
  };

  const columns = [
    {
      key: "voucherNumber",
      header: "Voucher #",
      sortable: true,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
    },
    {
      key: "headName",
      header: "Voucher Head",
      sortable: true,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      cell: (item: Voucher) => (
        <span className="font-semibold text-red-600">₹{item.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Method",
      cell: (item: Voucher) => (
        <Badge variant="outline" className="capitalize">
          {item.paymentMethod.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "paidTo",
      header: "Paid To",
    },
  ];

  const handleActions = (item: Voucher) => [
     { label: "View Details", onClick: () => handleView(item) },
     { label: "Edit", onClick: () => handleEdit(item) },
     { label: "Delete", onClick: () => handleDelete(item.id), destructive: true }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="Expense Vouchers"
          description="View and manage all expense transactions"
          breadcrumbs={[
            { label: "Expense", href: "/expense/expense-voucher" },
            { label: "Expense Vouchers" },
          ]}
          actions={
            <Button onClick={() => { setFormData({ date: new Date().toISOString().split("T")[0], paymentMethod: "cash" }); setIsCreateModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Expense Voucher
            </Button>
          }
        />

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={vouchers}
            searchPlaceholder="Search vouchers..."
            actions={handleActions}
          />
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Voucher Details</DialogTitle>
            <DialogDescription>Detailed information about the expense.</DialogDescription>
          </DialogHeader>
          {selectedVoucher && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Voucher Information</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-medium">Voucher #: {selectedVoucher.voucherNumber}</p>
                    <p className="text-sm">Date: {selectedVoucher.date}</p>
                    <p className="text-sm">Head: {selectedVoucher.headName}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Payment Details</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm">Method: <span className="capitalize">{selectedVoucher.paymentMethod.replace("_", " ")}</span></p>
                    <p className="font-bold text-red-600 text-lg">Amount: ₹{selectedVoucher.amount.toLocaleString()}</p>
                    {selectedVoucher.referenceNumber && <p className="text-sm">Ref #: {selectedVoucher.referenceNumber}</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Recipient Information</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-medium">Paid To: {selectedVoucher.paidTo || "N/A"}</p>
                  </div>
                </div>
                {selectedVoucher.bankName && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Bank Details</Label>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm">Bank: {selectedVoucher.bankName}</p>
                      {selectedVoucher.branchName && <p className="text-sm">Branch: {selectedVoucher.branchName}</p>}
                      {selectedVoucher.chequeNumber && <p className="text-sm">Cheque #: {selectedVoucher.chequeNumber}</p>}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-2 border-t pt-4">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description & Remarks</Label>
                <div className="mt-2 space-y-2">
                   <p className="text-sm bg-muted p-2 rounded">{selectedVoucher.description || "No description provided."}</p>
                   {selectedVoucher.remarks && <p className="text-xs italic text-muted-foreground">Remarks: {selectedVoucher.remarks}</p>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewModalOpen(false); handleEdit(selectedVoucher!); }}>Edit Voucher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <Dialog 
        open={isCreateModalOpen || isEditModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? "Create Expense Voucher" : "Edit Expense Voucher"}</DialogTitle>
            <DialogDescription>
              {isCreateModalOpen ? "Fill in the details to record a new expense." : "Update the voucher details below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voucherNumber">Voucher Number *</Label>
                <Input
                  id="voucherNumber"
                  value={formData.voucherNumber || ""}
                  onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker value={formData.date || ""} onChange={(v) => setFormData({ ...formData, date: v })} id="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headId">Voucher Head *</Label>
                <Select
                  value={formData.headId}
                  onValueChange={(value) => setFormData({ ...formData, headId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Salary Expense</SelectItem>
                    <SelectItem value="2">Office Rent</SelectItem>
                    <SelectItem value="3">Student Fee Income</SelectItem>
                    <SelectItem value="4">Other Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidTo">Paid To</Label>
                <Input
                  id="paidTo"
                  value={formData.paidTo || ""}
                  onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                />
              </div>
            </div>

            {(formData.paymentMethod === "cheque" || formData.paymentMethod === "bank_transfer") && (
              <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                <h4 className="text-sm font-semibold">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Reference / Ref #</Label>
                    <Input
                      id="referenceNumber"
                      value={formData.referenceNumber || ""}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
              <Button type="submit">
                <Banknote className="mr-2 h-4 w-4" />
                {isCreateModalOpen ? "Create Voucher" : "Update Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ExpenseVoucher;

