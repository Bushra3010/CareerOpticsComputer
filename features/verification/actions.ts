"use server";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

import { allowVerificationLookup } from "./rate-limit";

export interface CertificateResult {
  documentNumber: string;
  studentName: string;
  courseName: string;
  centreName: string;
  outcome: "fail" | "pass" | "distinction";
  issuedOn: string;
  status: "pending" | "issued" | "revoked";
}

export interface RegistrationResult {
  registrationNumber: string;
  studentName: string;
  courseName: string | null;
  centreName: string;
  enrolmentStatus: string | null;
}

export interface VerifyState {
  status: "idle" | "not-found" | "found" | "error";
  message?: string;
  certificate?: CertificateResult;
  registration?: RegistrationResult;
}

export async function verifyCertificate(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const number = formData.get("number")?.toString().trim() ?? "";
  if (!number) {
    return { status: "error", message: "Enter a certificate number." };
  }

  const allowed = await allowVerificationLookup();
  if (!allowed) {
    return {
      status: "error",
      message: "Too many lookups. Please try again shortly.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "verify_certificate", {
    p_number: number,
  });

  if (error) {
    return {
      status: "error",
      message: "Verification is unavailable right now.",
    };
  }

  const row = data?.[0];
  if (!row) {
    return { status: "not-found" };
  }

  return {
    status: "found",
    certificate: {
      documentNumber: row.document_number,
      studentName: row.student_name,
      courseName: row.course_name,
      centreName: row.centre_name,
      outcome: row.outcome,
      issuedOn: row.issued_on,
      status: row.status,
    },
  };
}

export async function verifyRegistration(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const number = formData.get("number")?.toString().trim() ?? "";
  if (!number) {
    return { status: "error", message: "Enter a registration number." };
  }

  const allowed = await allowVerificationLookup();
  if (!allowed) {
    return {
      status: "error",
      message: "Too many lookups. Please try again shortly.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "verify_registration", {
    p_registration_number: number,
  });

  if (error) {
    return {
      status: "error",
      message: "Verification is unavailable right now.",
    };
  }

  const row = data?.[0];
  if (!row) {
    return { status: "not-found" };
  }

  return {
    status: "found",
    registration: {
      registrationNumber: row.registration_number,
      studentName: row.student_name,
      courseName: row.course_name,
      centreName: row.centre_name,
      enrolmentStatus: row.enrolment_status,
    },
  };
}
