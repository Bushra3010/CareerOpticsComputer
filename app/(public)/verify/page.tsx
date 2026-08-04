import Link from "next/link";
import type { Metadata } from "next";
import { Award, IdCard } from "lucide-react";

import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verify a credential",
  description:
    "Confirm a Career Optics registration or certificate is genuine.",
};

export default function VerifyHubPage() {
  return (
    <div className="container-public max-w-3xl py-12">
      <h1 className="text-page-title text-navy-900">Verify a credential</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Employers and institutions can confirm that a Career Optics registration
        or certificate is genuine. Verification is free and needs no account.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <CardContent className="space-y-2 p-0">
            <Award className="size-6 text-blue-700" aria-hidden="true" />
            <CardTitle>Certificate</CardTitle>
            <CardDescription>
              Check a certificate number printed on a completion certificate.
            </CardDescription>
            <Link
              href="/verify/certificate"
              className="text-body inline-block pt-2 font-semibold text-blue-700"
            >
              Verify a certificate
            </Link>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="space-y-2 p-0">
            <IdCard className="size-6 text-blue-700" aria-hidden="true" />
            <CardTitle>Registration</CardTitle>
            <CardDescription>
              Check that a registration number belongs to a real student.
            </CardDescription>
            <Link
              href="/verify/registration"
              className="text-body inline-block pt-2 font-semibold text-blue-700"
            >
              Verify a registration
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
