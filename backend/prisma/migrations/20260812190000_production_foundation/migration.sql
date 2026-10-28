CREATE TYPE "SystemRole" AS ENUM ('SUPER_ADMIN','ORGANIZATION_ADMIN','BRANCH_ADMIN','ACCOUNTANT','RECEPTIONIST','TEACHER','STAFF','STUDENT');
CREATE TYPE "FeeStatus" AS ENUM ('DUE','PARTIAL','PAID','VOID');
CREATE TYPE "FeePaymentMethod" AS ENUM ('CASH','UPI','CARD','BANK_TRANSFER','CHEQUE');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT','ABSENT','LATE','EXCUSED');

ALTER TABLE "users" ADD COLUMN "role" "SystemRole" NOT NULL DEFAULT 'STAFF';

CREATE TABLE "refresh_sessions" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL,
  "userAgent" TEXT, "ipAddress" TEXT, "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_sessions_tokenHash_key" ON "refresh_sessions"("tokenHash");
CREATE INDEX "refresh_sessions_userId_idx" ON "refresh_sessions"("userId");
CREATE INDEX "refresh_sessions_expiresAt_idx" ON "refresh_sessions"("expiresAt");
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "audit_events" (
  "id" TEXT NOT NULL, "actorId" TEXT, "organizationId" TEXT, "branchId" TEXT,
  "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT,
  "before" JSONB, "after" JSONB, "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_events_organizationId_createdAt_idx" ON "audit_events"("organizationId","createdAt");
CREATE INDEX "audit_events_branchId_createdAt_idx" ON "audit_events"("branchId","createdAt");
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType","entityId");
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "fee_invoices" (
  "id" TEXT NOT NULL, "studentId" TEXT NOT NULL, "branchId" TEXT NOT NULL,
  "invoiceNo" TEXT NOT NULL, "description" TEXT NOT NULL, "amount" DECIMAL(12,2) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL, "status" "FeeStatus" NOT NULL DEFAULT 'DUE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fee_invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "fee_invoices_invoiceNo_key" ON "fee_invoices"("invoiceNo");
CREATE INDEX "fee_invoices_studentId_idx" ON "fee_invoices"("studentId");
CREATE INDEX "fee_invoices_branchId_status_idx" ON "fee_invoices"("branchId","status");
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "fee_payments" (
  "id" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "receiptNo" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL, "method" "FeePaymentMethod" NOT NULL,
  "referenceNo" TEXT, "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "receivedById" TEXT NOT NULL, "reversedAt" TIMESTAMP(3), "reversalNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "fee_payments_receiptNo_key" ON "fee_payments"("receiptNo");
CREATE INDEX "fee_payments_invoiceId_idx" ON "fee_payments"("invoiceId");
CREATE INDEX "fee_payments_paidAt_idx" ON "fee_payments"("paidAt");
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fee_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "attendance_records" (
  "id" TEXT NOT NULL, "studentId" TEXT NOT NULL, "branchId" TEXT NOT NULL, "batchId" TEXT,
  "date" DATE NOT NULL, "status" "AttendanceStatus" NOT NULL, "remarks" TEXT,
  "markedById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "attendance_records_studentId_date_key" ON "attendance_records"("studentId","date");
CREATE INDEX "attendance_records_branchId_date_idx" ON "attendance_records"("branchId","date");
CREATE INDEX "attendance_records_batchId_date_idx" ON "attendance_records"("batchId","date");
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
