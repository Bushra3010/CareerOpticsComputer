import type { Metadata } from "next";

import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Centre sign-in" };

export default async function CentreSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <SignInForm portal="centre" next={next} title="Centre & staff sign-in" />
  );
}
