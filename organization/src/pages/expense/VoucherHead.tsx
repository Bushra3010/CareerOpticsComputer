import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

interface VoucherHead {
  id: string;
  headName: string;
  headCode: string;
  headType: "income" | "expense" | "asset" | "liability";
  description: string;
  openingBalance: number;
  balanceType: "debit" | "credit";
  status: "active" | "inactive";
  createdDate: string;
}

const sampleVoucherHeads: VoucherHead[] = [
  {
    id: "1",
    headName: "Salary Expense",
    headCode: "VH-001",
    headType: "expense",
    description: "Monthly salary payments to staff",
    openingBalance: 0,
    balanceType: "debit",
    status: "active",
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    headName: "Office Rent",
    headCode: "VH-002",
    headType: "expense",
    description: "Monthly office rent payment",
    openingBalance: 50000,
    balanceType: "debit",
    status: "active",
    createdDate: "2024-01-20",
  },
];

const VoucherHead = () => {
  const { toast } = useToast();
  const [voucherHeads, setVoucherHeads] = useState<VoucherHead[]>(sampleVoucherHeads);
  const [selectedHead, setSelectedHead] = useState<VoucherHead | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<VoucherHead>>({});

  const handleDelete = (id: string) => {
    setVoucherHeads(prev => prev.filter(head => head.id !== id));
    toast({
      title: "Voucher Head Deleted",
      description: "The voucher head has been removed successfully.",
    });
  };

  const handleEdit = (head: VoucherHead) => {
    setSelectedHead(head);
    setFormData(head);
    setIsEditModalOpen(true);
  };

  const handleView = (head: VoucherHead) => {
    setSelectedHead(head);
    setIsViewModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherHeads(prev =>
      prev.map(head => (head.id === formData.id ? { ...head, ...formData } : head))
    );
    setIsEditModalOpen(false);
    toast({
      title: "Success",
      description: "Voucher head updated successfully!",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newHead: VoucherHead = {
      ...(formData as VoucherHead),
      id: Math.random().toString(36).substr(2, 9),
      createdDate: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setVoucherHeads(prev => [...prev, newHead]);
    setIsCreateModalOpen(false);
    setFormData({});
    toast({
      title: "Success",
      description: "Voucher head created successfully!",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income": return "bg-green-100 text-green-800";
      case "expense": return "bg-red-100 text-red-800";
      case "asset": return "bg-blue-100 text-blue-800";
      case "liability": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { key: "headCode", header: "Code", sortable: true },
    { key: "headName", header: "Head Name", sortable: true },
    {
      key: "headType",
      header: "Type",
      cell: (item: VoucherHead) => (
        <Badge className={getTypeColor(item.headType)}>
          {item.headType.charAt(0).toUpperCase() + item.headType.slice(1)}
        </Badge>
      ),
    },
    {
      key: "openingBalance",
      header: "Balance",
      cell: (item: VoucherHead) => `₹${Number(item.openingBalance).toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (item: VoucherHead) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="Voucher Heads"
          description="Manage categories for your vouchers"
          breadcrumbs={[
            { label: "Expense", href: "/expense/voucher-head" },
            { label: "Voucher Head" },
          ]}
          actions={
            <Button onClick={() => { setFormData({ balanceType: "debit" }); setIsCreateModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Voucher Head
            </Button>
          }
        />

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={voucherHeads}
            searchPlaceholder="Search voucher heads..."
            actions={(item) => [
              { label: "View Details", onClick: () => handleView(item) },
              { label: "Edit", onClick: () => handleEdit(item) },
              { label: "Delete", onClick: () => handleDelete(item.id), destructive: true }
            ]}
          />
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voucher Head Details</DialogTitle>
          </DialogHeader>
          {selectedHead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedHead.headName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Code</Label>
                  <p className="font-medium">{selectedHead.headCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div>
                    <Badge className={getTypeColor(selectedHead.headType)}>{selectedHead.headType}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Balance</Label>
                  <p className="font-medium">₹{Number(selectedHead.openingBalance).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedHead.description || "No description."}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <Dialog open={isEditModalOpen || isCreateModalOpen} onOpenChange={(open) => { if(!open) { setIsEditModalOpen(false); setIsCreateModalOpen(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? "Create Voucher Head" : "Edit Voucher Head"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input value={formData.headName || ""} onChange={e => setFormData({...formData, headName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input value={formData.headCode || ""} onChange={e => setFormData({...formData, headCode: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.headType} onValueChange={(val: any) => setFormData({...formData, headType: val})}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Opening Balance</Label>
                <Input type="number" value={formData.openingBalance || ""} onChange={e => setFormData({...formData, openingBalance: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setIsCreateModalOpen(false); }}>Cancel</Button>
              <Button type="submit">{isCreateModalOpen ? "Create" : "Update"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default VoucherHead;

