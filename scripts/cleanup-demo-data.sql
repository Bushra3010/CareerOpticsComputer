-- Cleanup script to remove all demo data from the database.
-- Run this against your database to wipe everything clean.
-- Order respects foreign key dependencies.

-- 1. Delete child tables first (no FK back to parents)
TRUNCATE TABLE exam_results      CASCADE;
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE fee_payments      CASCADE;
TRUNCATE TABLE fee_invoices      CASCADE;
TRUNCATE TABLE batch_timings     CASCADE;
TRUNCATE TABLE visit_enquiries   CASCADE;
TRUNCATE TABLE item_dispatches   CASCADE;
TRUNCATE TABLE item_received     CASCADE;
TRUNCATE TABLE branch_transactions CASCADE;
TRUNCATE TABLE branch_notices    CASCADE;
TRUNCATE TABLE branch_renewal_history CASCADE;

-- 2. Delete one-to-one extension tables
TRUNCATE TABLE branch_wallets    CASCADE;
TRUNCATE TABLE branch_settings   CASCADE;
TRUNCATE TABLE branch_directors  CASCADE;
TRUNCATE TABLE branch_addresses  CASCADE;
TRUNCATE TABLE branch_licenses   CASCADE;

-- 3. Delete join / child tables
TRUNCATE TABLE branch_courses    CASCADE;
TRUNCATE TABLE students          CASCADE;
TRUNCATE TABLE batches           CASCADE;
TRUNCATE TABLE exams             CASCADE;

-- 4. Delete parent tables
TRUNCATE TABLE courses           CASCADE;
TRUNCATE TABLE branches          CASCADE;
TRUNCATE TABLE organizations     CASCADE;

-- 5. Delete auth tables (must be last — FK targets)
TRUNCATE TABLE refresh_sessions  CASCADE;
TRUNCATE TABLE audit_events      CASCADE;
TRUNCATE TABLE users             CASCADE;
