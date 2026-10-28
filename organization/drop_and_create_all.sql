-- ============================================================
-- Career Optics ERP - Drop ALL tables and recreate fresh
-- Run this ONCE in Supabase SQL Editor
-- This will DELETE all existing data and recreate everything
-- ============================================================

-- =====================
-- DROP ALL TABLES (CASCADE)
-- =====================
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS refresh_sessions CASCADE;
DROP TABLE IF EXISTS branch_renewal_history CASCADE;
DROP TABLE IF EXISTS branch_licenses CASCADE;
DROP TABLE IF EXISTS branch_addresses CASCADE;
DROP TABLE IF EXISTS branch_directors CASCADE;
DROP TABLE IF EXISTS branch_settings CASCADE;
DROP TABLE IF EXISTS branch_notices CASCADE;
DROP TABLE IF EXISTS branch_transactions CASCADE;
DROP TABLE IF EXISTS branch_wallets CASCADE;
DROP TABLE IF EXISTS visit_enquiries CASCADE;
DROP TABLE IF EXISTS item_received CASCADE;
DROP TABLE IF EXISTS item_dispatches CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS fee_payments CASCADE;
DROP TABLE IF EXISTS fee_invoices CASCADE;
DROP TABLE IF EXISTS batch_timings CASCADE;
DROP TABLE IF EXISTS branch_courses CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all enum types
DROP TYPE IF EXISTS "EnquiryStatus" CASCADE;
DROP TYPE IF EXISTS "ExamStatus" CASCADE;
DROP TYPE IF EXISTS "FeePaymentMethod" CASCADE;
DROP TYPE IF EXISTS "FeeStatus" CASCADE;
DROP TYPE IF EXISTS "SystemRole" CASCADE;
DROP TYPE IF EXISTS "UserType" CASCADE;
DROP TYPE IF EXISTS "AdmissionStatus" CASCADE;
DROP TYPE IF EXISTS "DayOfWeek" CASCADE;
DROP TYPE IF EXISTS "BatchStatus" CASCADE;
DROP TYPE IF EXISTS "DurationUnit" CASCADE;
DROP TYPE IF EXISTS "CourseCategory" CASCADE;
DROP TYPE IF EXISTS "NoticePriority" CASCADE;
DROP TYPE IF EXISTS "NoticeType" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "TransactionStatus" CASCADE;
DROP TYPE IF EXISTS "TransactionType" CASCADE;
DROP TYPE IF EXISTS "CourierService" CASCADE;
DROP TYPE IF EXISTS "ItemCondition" CASCADE;
DROP TYPE IF EXISTS "ItemStatus" CASCADE;
DROP TYPE IF EXISTS "DepartmentType" CASCADE;
DROP TYPE IF EXISTS "VisitorIdType" CASCADE;
DROP TYPE IF EXISTS "VisitPurpose" CASCADE;
DROP TYPE IF EXISTS "Gender" CASCADE;
DROP TYPE IF EXISTS "BranchType" CASCADE;
DROP TYPE IF EXISTS "InstituteType" CASCADE;

-- =====================
-- ENUM TYPES
-- =====================
CREATE TYPE "InstituteType" AS ENUM ('COMPUTER', 'TYPING', 'PARAMEDICAL', 'OTHER');
CREATE TYPE "BranchType" AS ENUM ('MAIN', 'SUB', 'FRANCHISE');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "VisitPurpose" AS ENUM ('ADMISSION', 'FEE', 'MEETING', 'COMPLAINT', 'DELIVERY', 'INTERVIEW', 'OTHER');
CREATE TYPE "VisitorIdType" AS ENUM ('AADHAR', 'PAN', 'DRIVING', 'PASSPORT', 'VOTER');
CREATE TYPE "DepartmentType" AS ENUM ('ADMINISTRATION', 'ACADEMICS', 'ACCOUNTS', 'HR', 'IT', 'LIBRARY', 'SPORTS', 'LAB');
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');
CREATE TYPE "ItemCondition" AS ENUM ('GOOD', 'DAMAGED', 'PARTIAL');
CREATE TYPE "CourierService" AS ENUM ('BLUEDART', 'DTDC', 'FEDEX', 'DELHIVERY', 'INDIAPOST', 'SELF', 'HAND_DELIVERY');
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NET_BANKING', 'CASH');
CREATE TYPE "NoticeType" AS ENUM ('BRANCH', 'BATCH');
CREATE TYPE "NoticePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "CourseCategory" AS ENUM ('COMPUTER', 'VOCATIONAL', 'ACADEMIC', 'LANGUAGE', 'PROFESSIONAL', 'SKILL_DEVELOPMENT', 'OTHER');
CREATE TYPE "DurationUnit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS', 'YEARS');
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "AdmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_PAYMENT', 'APPROVED', 'REJECTED');
CREATE TYPE "UserType" AS ENUM ('ORGANIZATION', 'BRANCH', 'STUDENT');
CREATE TYPE "SystemRole" AS ENUM ('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'BRANCH_ADMIN', 'ACCOUNTANT', 'RECEPTIONIST', 'TEACHER', 'STAFF', 'STUDENT');
CREATE TYPE "FeeStatus" AS ENUM ('DUE', 'PARTIAL', 'PAID', 'VOID');
CREATE TYPE "FeePaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'MARKS_ENTRY', 'PUBLISHED');
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- =====================
-- CORE TABLES
-- =====================

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "logo" JSONB,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "branchType" "BranchType" NOT NULL DEFAULT 'MAIN',
    "instituteType" "InstituteType" NOT NULL DEFAULT 'COMPUTER',
    "academicYear" TEXT NOT NULL,
    "establishedYear" INTEGER,
    "website" TEXT,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT NOT NULL,
    "numComputers" INTEGER NOT NULL DEFAULT 0,
    "numFaculty" INTEGER NOT NULL DEFAULT 0,
    "numRooms" INTEGER NOT NULL DEFAULT 0,
    "branchMohar" JSONB,
    "branchPhoto" JSONB,
    "labPhoto" JSONB,
    "statusDocument" JSONB,
    "branchLogo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "onlineEnrollment" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "SystemRole" NOT NULL DEFAULT 'STAFF',
    "avatar" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "userId" TEXT,
    "enrollmentNo" TEXT,
    "applicationNo" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "bloodGroup" TEXT,
    "category" TEXT,
    "religion" TEXT,
    "nationality" TEXT NOT NULL DEFAULT 'Indian',
    "aadharNumber" TEXT,
    "apaarNumber" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academicYear" TEXT,
    "courseId" TEXT,
    "batchId" TEXT,
    "tenthSchoolName" TEXT,
    "tenthBoard" TEXT,
    "tenthYearOfPassing" INTEGER,
    "tenthPercentage" TEXT,
    "tenthRollNo" TEXT,
    "tenthSubjects" TEXT,
    "twelfthSchoolName" TEXT,
    "twelfthBoard" TEXT,
    "twelfthYearOfPassing" INTEGER,
    "twelfthPercentage" TEXT,
    "twelfthStream" TEXT,
    "twelfthSubjects" TEXT,
    "fatherName" TEXT NOT NULL,
    "fatherOccupation" TEXT,
    "fatherPhone" TEXT,
    "fatherEmail" TEXT,
    "fatherAnnualIncome" TEXT,
    "motherName" TEXT NOT NULL,
    "motherOccupation" TEXT,
    "motherPhone" TEXT,
    "localGuardianName" TEXT,
    "localGuardianRelation" TEXT,
    "localGuardianPhone" TEXT,
    "localGuardianAddress" TEXT,
    "photo" JSONB,
    "aadharFront" JSONB,
    "aadharBack" JSONB,
    "tenthMarksheet" JSONB,
    "twelfthMarksheet" JSONB,
    "transferCertificate" JSONB,
    "apaarCard" JSONB,
    "casteCertificate" JSONB,
    "admissionForm" JSONB,
    "admissionStatus" "AdmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "CourseCategory" NOT NULL DEFAULT 'COMPUTER',
    "description" TEXT,
    "durationValue" INTEGER NOT NULL,
    "durationUnit" "DurationUnit" NOT NULL DEFAULT 'MONTHS',
    "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "registrationFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "examFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "syllabus" JSONB,
    "eligibility" TEXT,
    "certification" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_courses" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "branchFee" DOUBLE PRECISION,
    "isOffered" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "maxSeats" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "examDate" DATE NOT NULL,
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "passMarks" INTEGER NOT NULL DEFAULT 40,
    "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- =====================
-- FEE TABLES
-- =====================
CREATE TABLE "fee_invoices" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeGroupId" TEXT,
    "dueDate" TEXT,
    "status" "FeeStatus" NOT NULL DEFAULT 'DUE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fee_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "FeePaymentMethod" NOT NULL,
    "referenceNo" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedById" TEXT NOT NULL,
    "reversedAt" TIMESTAMP(3),
    "reversalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- =====================
-- ATTENDANCE TABLE
-- =====================
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "batchId" TEXT,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "markedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- =====================
-- EXAM RESULTS TABLE
-- =====================
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- =====================
-- VISIT ENQUIRIES TABLE
-- =====================
CREATE TABLE "visit_enquiries" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "idType" "VisitorIdType" NOT NULL DEFAULT 'AADHAR',
    "idNumber" TEXT,
    "company" TEXT,
    "address" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitTime" TEXT NOT NULL,
    "purpose" "VisitPurpose" NOT NULL DEFAULT 'OTHER',
    "personToMeet" TEXT NOT NULL,
    "department" "DepartmentType" NOT NULL DEFAULT 'ADMINISTRATION',
    "noOfPersons" INTEGER NOT NULL DEFAULT 1,
    "enquiryReason" TEXT,
    "location" TEXT,
    "remarks" TEXT,
    "followUpDate" TIMESTAMP(3),
    "followUpTime" TEXT,
    "followUpNotes" TEXT,
    "visitorPhoto" JSONB,
    "idDocument" JSONB,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "closeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "visit_enquiries_pkey" PRIMARY KEY ("id")
);

-- =====================
-- BRANCH TABLES
-- =====================
CREATE TABLE "branch_wallets" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRechargeAmount" DOUBLE PRECISION,
    "lastRechargeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_wallets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_transactions" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'CREDIT',
    "category" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'UPI',
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_notices" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL DEFAULT 'BRANCH',
    "batch" TEXT,
    "priority" "NoticePriority" NOT NULL DEFAULT 'MEDIUM',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_notices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_settings" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "siteName" TEXT,
    "tagline" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "primaryDomain" TEXT,
    "subdomain" TEXT,
    "enableSsl" BOOLEAN NOT NULL DEFAULT true,
    "mediaAssets" JSONB,
    "socialLinks" JSONB,
    "featureToggles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_directors" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "bloodGroup" TEXT,
    "photo" JSONB,
    "signature" JSONB,
    "aadharFront" JSONB,
    "aadharBack" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_directors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_addresses" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "block" TEXT,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "country" TEXT NOT NULL DEFAULT 'India',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_licenses" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "validDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "referralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_licenses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_renewal_history" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "previousExpiry" TIMESTAMP(3) NOT NULL,
    "newExpiry" TIMESTAMP(3) NOT NULL,
    "amountPaid" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branch_renewal_history_pkey" PRIMARY KEY ("id")
);

-- =====================
-- BATCH TIMINGS TABLE
-- =====================
CREATE TABLE "batch_timings" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roomNo" TEXT,
    "instructor" TEXT,
    "subject" TEXT,
    CONSTRAINT "batch_timings_pkey" PRIMARY KEY ("id")
);

-- =====================
-- SUPPORT TABLES
-- =====================
CREATE TABLE "item_dispatches" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "courierService" "CourierService" NOT NULL DEFAULT 'SELF',
    "trackingNumber" TEXT,
    "dispatchDate" TIMESTAMP(3) NOT NULL,
    "expectedDelivery" TIMESTAMP(3),
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "item_dispatches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "item_received" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderPhone" TEXT,
    "senderAddress" TEXT,
    "courierService" "CourierService" NOT NULL DEFAULT 'HAND_DELIVERY',
    "trackingNumber" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "department" "DepartmentType" NOT NULL DEFAULT 'ADMINISTRATION',
    "condition" "ItemCondition" NOT NULL DEFAULT 'GOOD',
    "receivedBy" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "item_received_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "refresh_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "organizationId" TEXT,
    "branchId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- =====================
-- INDEXES
-- =====================

-- Organizations
CREATE UNIQUE INDEX "organizations_userId_key" ON "organizations"("userId");
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");
CREATE INDEX "organizations_code_idx" ON "organizations"("code");

-- Branches
CREATE UNIQUE INDEX "branches_userId_key" ON "branches"("userId");
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");
CREATE UNIQUE INDEX "branches_email_key" ON "branches"("email");
CREATE INDEX "branches_organizationId_idx" ON "branches"("organizationId");
CREATE INDEX "branches_code_idx" ON "branches"("code");
CREATE INDEX "branches_email_idx" ON "branches"("email");

-- Users
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE INDEX "users_userType_idx" ON "users"("userType");
CREATE INDEX "users_role_idx" ON "users"("role");

-- Students
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");
CREATE UNIQUE INDEX "students_enrollmentNo_key" ON "students"("enrollmentNo");
CREATE UNIQUE INDEX "students_applicationNo_key" ON "students"("applicationNo");
CREATE INDEX "students_branchId_idx" ON "students"("branchId");
CREATE INDEX "students_courseId_idx" ON "students"("courseId");
CREATE INDEX "students_batchId_idx" ON "students"("batchId");
CREATE INDEX "students_enrollmentNo_idx" ON "students"("enrollmentNo");
CREATE INDEX "students_applicationNo_idx" ON "students"("applicationNo");

-- Courses
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");
CREATE INDEX "courses_organizationId_idx" ON "courses"("organizationId");
CREATE INDEX "courses_code_idx" ON "courses"("code");

-- Branch Courses
CREATE INDEX "branch_courses_branchId_idx" ON "branch_courses"("branchId");
CREATE INDEX "branch_courses_courseId_idx" ON "branch_courses"("courseId");
CREATE UNIQUE INDEX "branch_courses_branchId_courseId_key" ON "branch_courses"("branchId", "courseId");

-- Batches
CREATE INDEX "batches_branchId_idx" ON "batches"("branchId");
CREATE INDEX "batches_courseId_idx" ON "batches"("courseId");
CREATE INDEX "batches_code_idx" ON "batches"("code");

-- Exams
CREATE INDEX "exams_branchId_examDate_idx" ON "exams"("branchId", "examDate");
CREATE INDEX "exams_courseId_idx" ON "exams"("courseId");

-- Exam Results
CREATE INDEX "exam_results_studentId_idx" ON "exam_results"("studentId");
CREATE UNIQUE INDEX "exam_results_examId_studentId_key" ON "exam_results"("examId", "studentId");

-- Fee Invoices
CREATE UNIQUE INDEX "fee_invoices_invoiceNo_key" ON "fee_invoices"("invoiceNo");
CREATE INDEX "fee_invoices_studentId_idx" ON "fee_invoices"("studentId");
CREATE INDEX "fee_invoices_branchId_status_idx" ON "fee_invoices"("branchId", "status");

-- Fee Payments
CREATE UNIQUE INDEX "fee_payments_receiptNo_key" ON "fee_payments"("receiptNo");
CREATE INDEX "fee_payments_invoiceId_idx" ON "fee_payments"("invoiceId");
CREATE INDEX "fee_payments_paidAt_idx" ON "fee_payments"("paidAt");

-- Attendance
CREATE UNIQUE INDEX "attendance_records_studentId_date_key" ON "attendance_records"("studentId", "date");
CREATE INDEX "attendance_records_branchId_date_idx" ON "attendance_records"("branchId", "date");
CREATE INDEX "attendance_records_batchId_date_idx" ON "attendance_records"("batchId", "date");

-- Visit Enquiries
CREATE INDEX "visit_enquiries_branchId_idx" ON "visit_enquiries"("branchId");

-- Branch Wallets
CREATE UNIQUE INDEX "branch_wallets_branchId_key" ON "branch_wallets"("branchId");

-- Branch Transactions
CREATE INDEX "branch_transactions_branchId_idx" ON "branch_transactions"("branchId");

-- Branch Notices
CREATE INDEX "branch_notices_branchId_idx" ON "branch_notices"("branchId");

-- Branch Settings
CREATE UNIQUE INDEX "branch_settings_branchId_key" ON "branch_settings"("branchId");

-- Branch Directors
CREATE UNIQUE INDEX "branch_directors_branchId_key" ON "branch_directors"("branchId");

-- Branch Addresses
CREATE UNIQUE INDEX "branch_addresses_branchId_key" ON "branch_addresses"("branchId");

-- Branch Licenses
CREATE UNIQUE INDEX "branch_licenses_branchId_key" ON "branch_licenses"("branchId");

-- Batch Timings
CREATE INDEX "batch_timings_batchId_idx" ON "batch_timings"("batchId");

-- Refresh Sessions
CREATE UNIQUE INDEX "refresh_sessions_tokenHash_key" ON "refresh_sessions"("tokenHash");
CREATE INDEX "refresh_sessions_userId_idx" ON "refresh_sessions"("userId");
CREATE INDEX "refresh_sessions_expiresAt_idx" ON "refresh_sessions"("expiresAt");

-- Audit Events
CREATE INDEX "audit_events_organizationId_createdAt_idx" ON "audit_events"("organizationId", "createdAt");
CREATE INDEX "audit_events_branchId_createdAt_idx" ON "audit_events"("branchId", "createdAt");
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- =====================
-- FOREIGN KEYS
-- =====================

-- Organizations
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Branches
ALTER TABLE "branches" ADD CONSTRAINT "branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "branches" ADD CONSTRAINT "branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Students
ALTER TABLE "students" ADD CONSTRAINT "students_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Courses
ALTER TABLE "courses" ADD CONSTRAINT "courses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Branch Courses
ALTER TABLE "branch_courses" ADD CONSTRAINT "branch_courses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "branch_courses" ADD CONSTRAINT "branch_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Batches
ALTER TABLE "batches" ADD CONSTRAINT "batches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "batches" ADD CONSTRAINT "batches_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Batch Timings
ALTER TABLE "batch_timings" ADD CONSTRAINT "batch_timings_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Exams
ALTER TABLE "exams" ADD CONSTRAINT "exams_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "exams" ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "exams" ADD CONSTRAINT "exams_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Exam Results
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Fee Invoices
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Fee Payments
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fee_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Attendance
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Visit Enquiries
ALTER TABLE "visit_enquiries" ADD CONSTRAINT "visit_enquiries_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Branch Wallets
ALTER TABLE "branch_wallets" ADD CONSTRAINT "branch_wallets_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Branch Transactions
ALTER TABLE "branch_transactions" ADD CONSTRAINT "branch_transactions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Branch Notices
ALTER TABLE "branch_notices" ADD CONSTRAINT "branch_notices_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Branch Settings
ALTER TABLE "branch_settings" ADD CONSTRAINT "branch_settings_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Branch Directors
ALTER TABLE "branch_directors" ADD CONSTRAINT "branch_directors_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Branch Addresses
ALTER TABLE "branch_addresses" ADD CONSTRAINT "branch_addresses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Branch Licenses
ALTER TABLE "branch_licenses" ADD CONSTRAINT "branch_licenses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Branch Renewal History
ALTER TABLE "branch_renewal_history" ADD CONSTRAINT "branch_renewal_history_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "branch_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Item Dispatches
ALTER TABLE "item_dispatches" ADD CONSTRAINT "item_dispatches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Item Received
ALTER TABLE "item_received" ADD CONSTRAINT "item_received_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Refresh Sessions
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Audit Events
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_timings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_renewal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Service role full access (server-side operations)
CREATE POLICY "Service role full access" ON organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON students FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON courses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_courses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON batches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON batch_timings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON exams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON exam_results FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON fee_invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON fee_payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON attendance_records FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON visit_enquiries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_wallets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_notices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_directors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_addresses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_licenses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branch_renewal_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON item_dispatches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON item_received FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON refresh_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON audit_events FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read their own profile
CREATE POLICY "Users read own profile" ON users FOR SELECT USING (auth.uid()::text = id);

-- =====================
-- DONE! All tables created fresh.
-- =====================

-- =====================
-- BROWSER (anon key + Supabase Auth session) ACCESS
-- The app queries Supabase directly from the browser, so requests arrive
-- as role "authenticated" - not "service_role". Without these policies
-- every insert fails with:
--   new row violates row-level security policy for table "..."
-- and every select silently returns zero rows.
-- NOTE: also run supabase-rls-fix.sql after this file - it adds the
-- "id" / "updatedAt" column defaults the client does not send.
-- =====================
CREATE POLICY "Authenticated full access" ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON batch_timings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON exams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON exam_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON fee_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON fee_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON attendance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON visit_enquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_wallets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_notices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_directors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_addresses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_licenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON branch_renewal_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON item_dispatches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON item_received FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON refresh_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON audit_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
