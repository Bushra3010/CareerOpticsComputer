-- 0005: academics — course categories and courses, public-readable when published.
-- (Build plan §3 groups this as "0005_academics"; course_versions, subjects,
-- centre_course_offerings, holidays and study_materials land with enrolments.)

create type public.course_publish_status as enum ('draft', 'published', 'archived');

create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.course_categories (id),
  name text not null,
  slug citext not null unique,
  short_description text not null,
  description text,
  duration_label text not null,
  fee_paise public.money_paise not null,
  status public.course_publish_status not null default 'draft',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create index courses_status_idx on public.courses (status, display_order);
create index courses_category_id_idx on public.courses (category_id);

create trigger set_updated_at
  before update on public.course_categories
  for each row execute function app.set_updated_at();

create trigger set_updated_at
  before update on public.courses
  for each row execute function app.set_updated_at();

alter table public.course_categories enable row level security;
alter table public.course_categories force row level security;
alter table public.courses enable row level security;
alter table public.courses force row level security;

-- The one intentional public read (build plan §5.2, R22): published courses
-- and their categories are readable by anyone, signed in or not.
create policy course_categories_public_read on public.course_categories
  for select to anon, authenticated
  using (true);

create policy courses_public_read on public.courses
  for select to anon, authenticated
  using (status = 'published');

create policy courses_platform_read_all on public.courses
  for select to authenticated
  using (app.is_platform_admin());

create policy courses_platform_write on public.courses
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());

create policy course_categories_platform_write on public.course_categories
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());
