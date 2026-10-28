-- CreateEnum
CREATE TYPE "InstituteType" AS ENUM ('COMPUTER', 'TYPING', 'PARAMEDICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "BranchType" AS ENUM ('MAIN', 'SUB', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "VisitPurpose" AS ENUM ('ADMISSION', 'FEE', 'MEETING', 'COMPLAINT', 'DELIVERY', 'INTERVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "VisitorIdType" AS ENUM ('AADHAR', 'PAN', 'DRIVING', 'PASSPORT', 'VOTER');

-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('ADMINISTRATION', 'ACADEMICS', 'ACCOUNTS', 'HR', 'IT', 'LIBRARY', 'SPORTS', 'LAB');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('GOOD', 'DAMAGED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "CourierService" AS ENUM ('BLUEDART', 'DTDC', 'FEDEX', 'DELHIVERY', 'INDIAPOST', 'SELF', 'HAND_DELIVERY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NET_BANKING', 'CASH');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('BRANCH', 'BATCH');

-- CreateEnum
CREATE TYPE "NoticePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('COMPUTER', 'VOCATIONAL', 'ACADEMIC', 'LANGUAGE', 'PROFESSIONAL', 'SKILL_DEVELOPMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_PAYMENT', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ORGANIZATION', 'BRANCH', 'STUDENT');

-- CreateTable
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

-- CreateTable
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visit_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "batch_timings" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roomNo" TEXT,

    CONSTRAINT "batch_timings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branches_userId_key" ON "branches"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "branches_email_key" ON "branches"("email");

-- CreateIndex
CREATE INDEX "branches_organizationId_idx" ON "branches"("organizationId");

-- CreateIndex
CREATE INDEX "branches_code_idx" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_email_idx" ON "branches"("email");

-- CreateIndex
CREATE INDEX "visit_enquiries_branchId_idx" ON "visit_enquiries"("branchId");

-- CreateIndex
CREATE INDEX "item_dispatches_branchId_idx" ON "item_dispatches"("branchId");

-- CreateIndex
CREATE INDEX "item_received_branchId_idx" ON "item_received"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_wallets_branchId_key" ON "branch_wallets"("branchId");

-- CreateIndex
CREATE INDEX "branch_transactions_branchId_idx" ON "branch_transactions"("branchId");

-- CreateIndex
CREATE INDEX "branch_notices_branchId_idx" ON "branch_notices"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_settings_branchId_key" ON "branch_settings"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_directors_branchId_key" ON "branch_directors"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_addresses_branchId_key" ON "branch_addresses"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_licenses_branchId_key" ON "branch_licenses"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE INDEX "courses_organizationId_idx" ON "courses"("organizationId");

-- CreateIndex
CREATE INDEX "courses_code_idx" ON "courses"("code");

-- CreateIndex
CREATE INDEX "branch_courses_branchId_idx" ON "branch_courses"("branchId");

-- CreateIndex
CREATE INDEX "branch_courses_courseId_idx" ON "branch_courses"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_courses_branchId_courseId_key" ON "branch_courses"("branchId", "courseId");

-- CreateIndex
CREATE INDEX "batches_branchId_idx" ON "batches"("branchId");

-- CreateIndex
CREATE INDEX "batches_courseId_idx" ON "batches"("courseId");

-- CreateIndex
CREATE INDEX "batches_code_idx" ON "batches"("code");

-- CreateIndex
CREATE INDEX "batch_timings_batchId_idx" ON "batch_timings"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_userId_key" ON "organizations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "organizations_code_idx" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_enrollmentNo_key" ON "students"("enrollmentNo");

-- CreateIndex
CREATE UNIQUE INDEX "students_applicationNo_key" ON "students"("applicationNo");

-- CreateIndex
CREATE INDEX "students_branchId_idx" ON "students"("branchId");

-- CreateIndex
CREATE INDEX "students_courseId_idx" ON "students"("courseId");

-- CreateIndex
CREATE INDEX "students_batchId_idx" ON "students"("batchId");

-- CreateIndex
CREATE INDEX "students_enrollmentNo_idx" ON "students"("enrollmentNo");

-- CreateIndex
CREATE INDEX "students_applicationNo_idx" ON "students"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_userType_idx" ON "users"("userType");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_enquiries" ADD CONSTRAINT "visit_enquiries_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_dispatches" ADD CONSTRAINT "item_dispatches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_received" ADD CONSTRAINT "item_received_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_wallets" ADD CONSTRAINT "branch_wallets_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transactions" ADD CONSTRAINT "branch_transactions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_notices" ADD CONSTRAINT "branch_notices_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_settings" ADD CONSTRAINT "branch_settings_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_directors" ADD CONSTRAINT "branch_directors_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_addresses" ADD CONSTRAINT "branch_addresses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_licenses" ADD CONSTRAINT "branch_licenses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_renewal_history" ADD CONSTRAINT "branch_renewal_history_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "branch_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_courses" ADD CONSTRAINT "branch_courses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_courses" ADD CONSTRAINT "branch_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_timings" ADD CONSTRAINT "batch_timings_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
