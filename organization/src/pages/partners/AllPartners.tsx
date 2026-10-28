import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Eye, Edit, Trash2, DollarSign, UserPlus, MapPin, Mail, Phone, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Partner {
  id: string;
  partnerName: string;
  partnerType: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  state?: string;
  pincode?: string;
  commissionRate: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  contactPerson?: string;
  designation?: string;
  notes?: string;
  status: "active" | "inactive";
  joinedDate: string;
}

const samplePartners: Partner[] = [
  {
    id: "1",
    partnerName: "John Education Services",
    partnerType: "organization",
    email: "john@edu.com",
    phone: "+91 9876543210",
    city: "Mumbai",
    commissionRate: "10",
    status: "active",
    joinedDate: "2024-01-15",
    contactPerson: "John Doe",
    address: "123 Education Lane",
  },
  {
    id: "2",
    partnerName: "Sarah Learning Hub",
    partnerType: "individual",
    email: "sarah@learning.com",
    phone: "+91 9876543211",
    city: "Delhi",
    commissionRate: "8",
    status: "active",
    joinedDate: "2024-02-20",
    contactPerson: "Sarah Smith",
  },
];

const AllPartners = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>(samplePartners);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Partner>>({});

  const handleDelete = (id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Partner Deleted",
      description: "The partner has been removed successfully.",
    });
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData(partner);
    setIsEditModalOpen(true);
  };

  const handleView = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsViewModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPartners(prev =>
      prev.map(p => (p.id === formData.id ? { ...p, ...formData } as Partner : p))
    );
    setIsEditModalOpen(false);
    toast({
      title: "Success",
      description: "Partner details updated successfully!",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPartner: Partner = {
      ...(formData as Partner),
      id: Math.random().toString(36).substr(2, 9),
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setPartners(prev => [...prev, newPartner]);
    setIsCreateModalOpen(false);
    setFormData({});
    toast({
      title: "Success",
      description: "New partner registered successfully!",
    });
  };

  const columns = [
    {
      key: "partnerName",
      header: "Partner Name",
      sortable: true,
      cell: (item: Partner) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.partnerName}</span>
          <span className="text-xs text-muted-foreground">{item.contactPerson}</span>
        </div>
      ),
    },
    {
      key: "partnerType",
      header: "Type",
      cell: (item: Partner) => (
        <Badge variant="outline" className="capitalize">
          {item.partnerType}
        </Badge>
      ),
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "city", header: "City", sortable: true },
    {
      key: "commissionRate",
      header: "Comm.",
      cell: (item: Partner) => `${item.commissionRate}%`,
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Partner) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  const handleActions = (item: Partner) => [
    { label: "View Details", onClick: () => handleView(item) },
    { label: "Edit Partner", onClick: () => handleEdit(item) },
    { label: "Transactions", onClick: () => navigate(`/partners/transactions`) },
    { label: "Delete", onClick: () => handleDelete(item.id), destructive: true }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="All Partners"
          description="Manage and view all registered partners"
          breadcrumbs={[
            { label: "Partners", href: "/partners/all" },
            { label: "All Partners" },
          ]}
          actions={
            <Button onClick={() => { setFormData({ partnerType: "individual" }); setIsCreateModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Partner
            </Button>
          }
        />

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={partners}
            searchPlaceholder="Search partners by name, email or phone..."
            actions={handleActions}
          />
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Partner Profile</DialogTitle>
            <DialogDescription>Full details and configuration for {selectedPartner?.partnerName}</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="bg-primary/10 p-2 rounded-full"><Building2 className="h-4 w-4 text-primary" /></div>
                   <div>
                      <Label className="text-muted-foreground text-[10px] uppercase">Business Info</Label>
                      <p className="font-bold text-lg">{selectedPartner.partnerName}</p>
                      <p className="text-sm text-muted-foreground">Type: <span className="capitalize">{selectedPartner.partnerType}</span></p>
                      <p className="text-sm text-muted-foreground">Joined: {selectedPartner.joinedDate}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-primary/10 p-2 rounded-full"><Mail className="h-4 w-4 text-primary" /></div>
                   <div>
                      <Label className="text-muted-foreground text-[10px] uppercase">Contact</Label>
                      <p className="text-sm font-medium">{selectedPartner.email}</p>
                      <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedPartner.phone}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-primary/10 p-2 rounded-full"><MapPin className="h-4 w-4 text-primary" /></div>
                   <div>
                      <Label className="text-muted-foreground text-[10px] uppercase">Address</Label>
                      <p className="text-sm">{selectedPartner.address || "N/A"}</p>
                      <p className="text-sm">{selectedPartner.city}{selectedPartner.state ? `, ${selectedPartner.state}` : ""}</p>
                   </div>
                </div>
              </div>
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                 <div>
                    <Label className="text-muted-foreground text-[10px] uppercase">Commission Rate</Label>
                    <p className="text-3xl font-bold text-primary">{selectedPartner.commissionRate}%</p>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">GST #</Label>
                        <p className="text-sm font-medium">{selectedPartner.gstNumber || "N/A"}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">PAN #</Label>
                        <p className="text-sm font-medium">{selectedPartner.panNumber || "N/A"}</p>
                    </div>
                 </div>
                 <div className="border-t pt-2 mt-2">
                    <Label className="text-xs text-muted-foreground">Bank Details</Label>
                    <p className="text-xs font-medium">{selectedPartner.bankName || "No Bank Linked"}</p>
                    {selectedPartner.accountNumber && <p className="text-xs">A/C: {selectedPartner.accountNumber}</p>}
                 </div>
              </div>
              {selectedPartner.notes && (
                <div className="col-span-2 space-y-1">
                   <Label className="text-xs text-muted-foreground uppercase">Internal Notes</Label>
                   <p className="text-sm bg-background border p-2 rounded italic text-muted-foreground">{selectedPartner.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewModalOpen(false); handleEdit(selectedPartner!); }}>Edit Partner</Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? "Register New Partner" : "Update Partner Profile"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="partnerName">Partner Name *</Label>
                <Input
                  id="partnerName"
                  value={formData.partnerName || ""}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerType">Partner Type</Label>
                <Select
                  value={formData.partnerType}
                  onValueChange={(value) => setFormData({ ...formData, partnerType: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="institution">Institution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  value={formData.commissionRate || ""}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson || ""}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber || ""}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
               <h4 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" /> Bank Information</h4>
               <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                     <Label>Bank Name</Label>
                     <Input value={formData.bankName || ""} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                  </div>
                  <div className="space-y-2 text-red-600">
                     <Label className="text-foreground">Acc Number</Label>
                     <Input value={formData.accountNumber || ""} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <Label>IFSC Code</Label>
                     <Input value={formData.ifscCode || ""} onChange={e => setFormData({...formData, ifscCode: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
              <Button type="submit">
                <UserPlus className="mr-2 h-4 w-4" />
                {isCreateModalOpen ? "Register Partner" : "Update Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AllPartners;

