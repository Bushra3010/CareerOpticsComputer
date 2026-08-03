import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Career Optics Computer Academy.",
};

export default function ContactPage() {
  return (
    <div className="container-public max-w-2xl py-12">
      <h1 className="text-page-title text-navy-900">Contact us</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        For admissions, use the enquiry form and a counsellor from your nearest
        centre will reach out. For anything else, reach head office directly.
      </p>

      <ul className="text-body text-text mt-8 space-y-4">
        <li className="flex items-start gap-3">
          <MapPin
            className="mt-0.5 size-5 shrink-0 text-blue-700"
            aria-hidden="true"
          />
          <span>Head office address to be confirmed</span>
        </li>
        <li className="flex items-start gap-3">
          <Phone
            className="mt-0.5 size-5 shrink-0 text-blue-700"
            aria-hidden="true"
          />
          <span>Contact number to be confirmed</span>
        </li>
        <li className="flex items-start gap-3">
          <Mail
            className="mt-0.5 size-5 shrink-0 text-blue-700"
            aria-hidden="true"
          />
          <span>Contact email to be confirmed</span>
        </li>
      </ul>

      <div className="mt-8">
        <Button asChild>
          <Link href="/admissions/enquiry">Send an admission enquiry</Link>
        </Button>
      </div>
    </div>
  );
}
