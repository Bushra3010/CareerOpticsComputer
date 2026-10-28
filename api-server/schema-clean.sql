CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES profiles(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  user_id TEXT UNIQUE REFERENCES profiles(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  branch_type TEXT DEFAULT 'MAIN',
  institute_type TEXT DEFAULT 'COMPUTER',
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'COMPUTER',
  description TEXT,
  duration_value INTEGER NOT NULL,
  duration_unit TEXT DEFAULT 'MONTHS',
  base_fee DECIMAL(12,2) DEFAULT 0,
  registration_fee DECIMAL(12,2) DEFAULT 0,
  exam_fee DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  max_seats INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'UPCOMING',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL,
  user_id TEXT UNIQUE,
  enrollment_no TEXT UNIQUE,
  application_no TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TIMESTAMPTZ NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  course_id TEXT,
  batch_id TEXT,
  admission_status TEXT DEFAULT 'DRAFT',
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  batch_id TEXT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  max_marks INTEGER DEFAULT 100,
  pass_marks INTEGER DEFAULT 40,
  status TEXT DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  remarks TEXT,
  graded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS fee_invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  invoice_no TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'DUE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT NOT NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL,
  reference_no TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  received_by_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  batch_id TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  remarks TEXT,
  marked_by_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS visit_enquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id TEXT NOT NULL,
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON branches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON courses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON batches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON students FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON exams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON exam_results FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON fee_invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON fee_payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON attendance_records FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON visit_enquiries FOR ALL USING (auth.role() = 'service_role');
