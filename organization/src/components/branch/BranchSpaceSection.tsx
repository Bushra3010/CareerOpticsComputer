 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { DatePicker } from "@/components/ui/date-picker";
 import { Label } from "@/components/ui/label";
 import { LayoutGrid, Calendar } from "lucide-react";
 
 export function BranchSpaceSection() {
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <LayoutGrid className="h-5 w-5" />
           Space & Facilities
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid gap-4 md:grid-cols-4">
           <div className="space-y-2">
             <Label htmlFor="numComputers">Number of Computers</Label>
             <Input id="numComputers" name="numComputers" type="number" placeholder="0" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="numFaculty">Number of Faculty</Label>
             <Input id="numFaculty" name="numFaculty" type="number" placeholder="0" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="numRooms">Number of Rooms</Label>
             <Input id="numRooms" name="numRooms" type="number" placeholder="0" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="numFees">Number of Fee Types</Label>
             <Input id="numFees" name="numFees" type="number" placeholder="0" />
           </div>
         </div>
         
         <div className="border-t pt-4">
           <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
             <Calendar className="h-4 w-4" />
             Registration & Validity
           </h4>
           <div className="grid gap-4 md:grid-cols-3">
             <div className="space-y-2">
               <Label htmlFor="registrationDate">Registration Date *</Label>
               <DatePicker id="registrationDate" name="registrationDate" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="validDate">Valid From</Label>
               <DatePicker id="validDate" name="validDate" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="expiryDate">Expiry Date *</Label>
               <DatePicker id="expiryDate" name="expiryDate" />
             </div>
           </div>
           <div className="grid gap-4 md:grid-cols-2 mt-4">
             <div className="space-y-2">
               <Label htmlFor="renewalDate">Renewal Date</Label>
               <DatePicker id="renewalDate" name="renewalDate" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="referralCode">Referral Code</Label>
               <Input id="referralCode" name="referralCode" placeholder="Enter referral code" />
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }