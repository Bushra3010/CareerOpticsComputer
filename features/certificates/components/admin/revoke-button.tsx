"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

import { revokeCertificate, type RevokeCertificateState } from "../../actions";

/**
 * Behind a confirmation dialog with a mandatory reason, deliberately — build
 * plan §4 puts certificate revocation on the step-up list precisely because
 * it is hard to reverse: an employer who has already seen "revoked" cannot be
 * shown "actually, no".
 */
export function RevokeCertificateButton({
  documentNumber,
}: {
  documentNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<RevokeCertificateState | null>(null);

  if (result?.status === "success") {
    return <span className="text-meta text-text-secondary">Revoked</span>;
  }

  const confirm = (reason?: string) => {
    const formData = new FormData();
    formData.set("reason", reason ?? "");
    startTransition(async () => {
      const next = await revokeCertificate(
        documentNumber,
        { status: "idle" },
        formData,
      );
      setResult(next);
      if (next.status === "success") setOpen(false);
    });
  };

  return (
    <>
      <Button
        variant="destructive-outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Revoke
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Revoke ${documentNumber}?`}
        target={documentNumber}
        consequence="Public verification will show this certificate as revoked immediately. This cannot be undone from here."
        confirmLabel="Revoke certificate"
        requireReason
        loading={pending}
        onConfirm={confirm}
      />
      {result?.status === "error" && result.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {result.message}
        </p>
      ) : null}
    </>
  );
}
