-- Career Optics ERP Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES (links to Supabase Auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'STAFF',
  user_type TEXT NOT NULL DEFAULT 'BRANCH',
  organization_id TEXT,
  branch_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES profiles(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  description TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);

-- ============================================
-- BRANCHES
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id TEXT UNIQUE REFERENCES profiles(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  branch_type TEXT DEFAULT 'MAIN',
  institute_type TEXT DEFAULT 'COMPUTER',
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  established_year INTEGER,
  website TEXT,
  description TEXT,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  whatsapp_number TEXT,
  email TEXT UNIQUE NOT NULL,
  num_computers INTEGER DEFAULT 0,
  num_faculty INTEGER DEFAULT 0,
  num_rooms INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  online_enrollment BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_org_id ON branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_email ON branches(email);

-- ============================================
-- COURSES
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'COMPUTER',
  description TEXT,
  duration_value INTEGER NOT NULL,
  duration_unit TEXT DEFAULT 'MONTHS',
  base_fee DECIMAL(12,2) DEFAULT 0,
  registration_fee DECIMAL(12,2) DEFAULT 0,
  exam_fee DECIMAL(12,2) DEFAULT 0,
  syllabus JSONB,
  eligibility TEXT,
  certification TEXT,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_org_id ON courses(organization_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

-- ============================================
-- BRANCH_COURSES
-- ============================================
CREATE TABLE IF NOT EXISTS branch_courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  branch_fee DECIMAL(12,2),
  is_offered BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_branch_courses_branch ON branch_courses(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_courses_course ON branch_courses(course_id);

-- ============================================
-- BATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  max_seats INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'UPCOMING',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batches_branch ON batches(branch_id);
CREATE INDEX IF NOT EXISTS idx_batches_course ON batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batches_code ON batches(code);

-- ============================================
-- STUDENTS
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  user_id TEXT UNIQUE REFERENCES profiles(id),
  enrollment_no TEXT UNIQUE,
  application_no TEXT UNIQUE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth TIMESTAMPTZ NOT NULL,
  gender TEXT NOT NULL,
  blood_group TEXT,
  category TEXT,
  religion TEXT,
  nationality TEXT DEFAULT 'Indian',
  aadhar_number TEXT,
  apaar_number TEXT,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  admission_date TIMESTAMPTZ DEFAULT now(),
  academic_year TEXT,
  course_id TEXT REFERENCES courses(id),
  batch_id TEXT REFERENCES batches(id),
  father_name TEXT NOT NULL,
  father_occupation TEXT,
  father_phone TEXT,
  father_email TEXT,
  father_annual_income TEXT,
  mother_name TEXT NOT NULL,
  mother_occupation TEXT,
  mother_phone TEXT,
  local_guardian_name TEXT,
  local_guardian_relation TEXT,
  local_guardian_phone TEXT,
  local_guardian_address TEXT,
  admission_status TEXT DEFAULT 'DRAFT',
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_application ON students(application_no);

-- ============================================
-- EXAMS
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  batch_id TEXT REFERENCES batches(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  max_marks INTEGER DEFAULT 100,
  pass_marks INTEGER DEFAULT 40,
  status TEXT DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exams_branch_date ON exams(branch_id, exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);

-- ============================================
-- EXAM_RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id),
  marks DECIMAL(5,2) NOT NULL,
  remarks TEXT,
  graded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);

-- ============================================
-- FEE_INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS fee_invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES students(id),
  branch_id TEXT NOT NULL REFERENCES branches(id),
  invoice_no TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'DUE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fee_invoices_student ON fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_branch ON fee_invoices(branch_id, status);

-- ============================================
-- FEE_PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS fee_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT NOT NULL REFERENCES fee_invoices(id),
  receipt_no TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL,
  reference_no TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  received_by_id TEXT,
  reversed_at TIMESTAMPTZ,
  reversal_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fee_payments_invoice ON fee_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_paid_at ON fee_payments(paid_at);

-- ============================================
-- ATTENDANCE_RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES students(id),
  branch_id TEXT NOT NULL REFERENCES branches(id),
  batch_id TEXT REFERENCES batches(id),
  date DATE NOT NULL,
  status TEXT NOT NULL,
  remarks TEXT,
  marked_by_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_branch_date ON attendance_records(branch_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON attendance_records(batch_id, date);

-- ============================================
-- VISIT_ENQUIRIES
-- ============================================
CREATE TABLE IF NOT EXISTS visit_enquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  visitor_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  purpose TEXT DEFAULT 'OTHER',
  person_to_meet TEXT NOT NULL,
  department TEXT DEFAULT 'ADMINISTRATION',
  enquiry_reason TEXT,
  visit_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_branch ON visit_enquiries(branch_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_enquiries ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON branches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON courses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON students FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON exams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON exam_results FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON fee_invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON fee_payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON attendance_records FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON visit_enquiries FOR ALL USING (auth.role() = 'service_role');
