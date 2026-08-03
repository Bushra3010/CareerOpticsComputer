"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/action";
import { checkRateLimit } from "@/lib/rate-limit";

import { forgotPasswordSchema, signInSchema } from "./schema";
import { resolvePostLoginPath, type Portal } from "./redirect";

export interface AuthFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const GENERIC_SIGN_IN_ERROR = "Incorrect email or password.";

export async function signIn(
  portal: Portal,
  next: string | undefined,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const { allowed } = checkRateLimit(
    `sign-in:${parsed.data.email}`,
    8,
    10 * 60 * 1000,
  );
  if (!allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please try again later.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  // Generic message either way — PRD requires no enumeration of which
  // accounts exist ("Enter a valid email and password" would leak less than
  // Supabase's own "Invalid login credentials", but keep it uniform).
  if (error || !data.user) {
    return { status: "error", message: GENERIC_SIGN_IN_ERROR };
  }

  const redirectPath =
    next && next.startsWith(`/${portal}`)
      ? next
      : await resolvePostLoginPath(supabase, data.user.id, portal);

  redirect(redirectPath);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email." };
  }

  const { allowed } = checkRateLimit(
    `reset:${parsed.data.email}`,
    5,
    15 * 60 * 1000,
  );
  if (!allowed) {
    return {
      status: "error",
      message: "Too many attempts. Please try again later.",
    };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  // Always success — confirming or denying an email exists is an enumeration
  // oracle (PRD, style guide auth requirements).
  return {
    status: "success",
    message: "If that email has an account, a reset link has been sent.",
  };
}
