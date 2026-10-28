 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Phone } from "lucide-react";
 
 export function ContactSection() {
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Phone className="h-5 w-5" />
           Contact Information
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2">
           <div className="space-y-2">
             <Label htmlFor="phone">Phone Number *</Label>
             <Input id="phone" name="phone" placeholder="+91 XXXXX XXXXX" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="altPhone">Alternate Phone</Label>
             <Input id="altPhone" name="altPhone" placeholder="+91 XXXXX XXXXX" />
           </div>
         </div>
         <div className="grid gap-4 md:grid-cols-2">
           <div className="space-y-2">
             <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
             <Input id="whatsappNumber" name="whatsappNumber" placeholder="+91 XXXXX XXXXX" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="email">Email Address *</Label>
             <Input id="email" name="email" type="email" placeholder="branch@example.com" />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }