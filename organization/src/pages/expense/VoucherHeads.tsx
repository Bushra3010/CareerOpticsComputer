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
import { Link } from "react-router-dom";

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

// Sample data - replace with actual API data
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
  {
    id: "3",
    headName: "Student Fee Income",
    headCode: "VH-003",
    headType: "income",
    description: "Fee collected from students",
    openingBalance: 100000,
    balanceType: "credit",
    status: "active",
    createdDate: "2024-02-01",
  },
  {
    id: "4",
    headName: "Computer Equipment",
    headCode: "VH-004",
    headType: "asset",
    description: "Computer and IT equipment purchases",
    openingBalance: 250000,
    balanceType: "debit",
    status: "active",
    createdDate: "2024-02-10",
  },
];

const VoucherHeads = () => {
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
      case "income":
        return "bg-green-100 text-green-800";
      case "expense":
        return "bg-red-100 text-red-800";
      case "asset":
        return "bg-blue-100 text-blue-800";
      case "liability":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "headCode",
      header: "Code",
      sortable: true,
    },
    {
      key: "headName",
      header: "Head Name",
      sortable: true,
      cell: (item: VoucherHead) => (
        <div className="font-medium">{item.headName}</div>
      ),
    },
    {
      key: "headType",
      header: "Type",
      sortable: true,
      cell: (item: VoucherHead) => (
        <Badge className={getTypeColor(item.headType)}>
          {item.headType.charAt(0).toUpperCase() + item.headType.slice(1)}
        </Badge>
      ),
    },
    {
      key: "openingBalance",
      header: "Opening Balance",
      sortable: true,
      cell: (item: VoucherHead) => (
        <span className="font-semibold">₹{Number(item.openingBalance).toLocaleString()}</span>
      ),
    },
    {
      key: "balanceType",
      header: "Balance Type",
      cell: (item: VoucherHead) => (
        <span className="capitalize">{item.balanceType}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: VoucherHead) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const handleActions = (item: VoucherHead) => [
    {
      label: "View Details",
      onClick: () => handleView(item),
      icon: <Eye className="mr-2 h-4 w-4" />,
    },
    {
      label: "Edit",
      onClick: () => handleEdit(item),
      icon: <Edit className="mr-2 h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: () => handleDelete(item.id),
      destructive: true,
      icon: <Trash2 className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="All Voucher Heads"
          description="Manage and view all voucher heads"
          breadcrumbs={[
            { label: "Expense", href: "/expense/voucher-heads" },
            { label: "All Voucher Heads" },
          ]}
          actions={
            <Button onClick={() => { setFormData({}); setIsCreateModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Voucher Head
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
            <DialogDescription>Detailed information about the voucher head.</DialogDescription>
          </DialogHeader>
          {selectedHead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Head Name</Label>
                  <p className="font-medium">{selectedHead.headName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Head Code</Label>
                  <p className="font-medium">{selectedHead.headCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Head Type</Label>
                  <div>
                    <Badge className={getTypeColor(selectedHead.headType)}>
                      {selectedHead.headType.charAt(0).toUpperCase() + selectedHead.headType.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={selectedHead.status === "active" ? "default" : "secondary"}>
                      {selectedHead.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Opening Balance</Label>
                  <p className="font-medium">₹{Number(selectedHead.openingBalance).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Balance Type</Label>
                  <p className="font-medium capitalize">{selectedHead.balanceType}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedHead.description || "No description provided."}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created Date</Label>
                <p className="text-sm">{selectedHead.createdDate}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewModalOpen(false); handleEdit(selectedHead!); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <Dialog 
        open={isEditModalOpen || isCreateModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditModalOpen(false);
            setIsCreateModalOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? "Create Voucher Head" : "Edit Voucher Head"}</DialogTitle>
            <DialogDescription>
              {isCreateModalOpen ? "Fill in the details to create a new voucher head." : "Update the voucher head information."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headName">Head Name *</Label>
                <Input
                  id="headName"
                  value={formData.headName || ""}
                  onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headCode">Head Code *</Label>
                <Input
                  id="headCode"
                  value={formData.headCode || ""}
                  onChange={(e) => setFormData({ ...formData, headCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headType">Head Type *</Label>
                <Select
                  value={formData.headType}
                  onValueChange={(value: any) => setFormData({ ...formData, headType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  value={formData.openingBalance || ""}
                  onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceType">Balance Type</Label>
                <Select
                  value={formData.balanceType}
                  onValueChange={(value: any) => setFormData({ ...formData, balanceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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

export default VoucherHeads;

