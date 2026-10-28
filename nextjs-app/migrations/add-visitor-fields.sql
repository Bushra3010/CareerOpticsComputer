-- Add missing fields to visit_enquiries table
ALTER TABLE "visit_enquiries"
  ADD COLUMN IF NOT EXISTS "checkOutTime" TEXT,
  ADD COLUMN IF NOT EXISTS "candidateName" TEXT,
  ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "registrationDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'WALK_IN',
  ADD COLUMN IF NOT EXISTS "referralName" TEXT,
  ADD COLUMN IF NOT EXISTS "section" TEXT;
