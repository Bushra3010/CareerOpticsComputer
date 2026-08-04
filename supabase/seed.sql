-- The platform's first (and for now only) tenant — build plan assumption A1.
insert into public.organizations (name, slug) values
  ('Career Optics Computer Academy', 'career-optics')
on conflict (slug) do nothing;

-- Minimal role/permission set for centre approval (build plan §4 role matrix
-- lists far more permissions; seeded incrementally as each feature needs
-- them rather than all 60+ up front).
insert into public.permissions (code, description) values
  ('centre.read', 'Read centre records'),
  ('centre.update', 'Update centre records'),
  ('student.create', 'Create student records'),
  ('student.read', 'Read student records')
on conflict (code) do nothing;

insert into public.roles (organization_id, code, name, is_system_role)
select id, 'centre_owner', 'Centre Owner', true
from public.organizations where slug = 'career-optics'
on conflict (organization_id, code) do nothing;

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
join public.organizations o on o.id = r.organization_id and o.slug = 'career-optics'
cross join (values ('centre.read'), ('centre.update'), ('student.create'), ('student.read')) as p(code)
where r.code = 'centre_owner'
on conflict do nothing;

-- Initial course catalogue. Synthetic but realistic Indian computer-academy
-- offerings (build plan §1.4, decision D5) — replace with the real catalogue
-- when it's available; this is not demo data under /dev, it's the seed for
-- the real public course listing.

insert into public.course_categories (name, slug, display_order) values
  ('Foundation Courses', 'foundation-courses', 1),
  ('Diploma Programs', 'diploma-programs', 2),
  ('Office & Accounting', 'office-and-accounting', 3),
  ('Design & Multimedia', 'design-and-multimedia', 4)
on conflict (slug) do nothing;

insert into public.courses (category_id, name, slug, short_description, description, duration_label, fee_paise, status, display_order)
select c.id, v.name, v.slug, v.short_description, v.description, v.duration_label, v.fee_paise, 'published', v.display_order
from (values
  ('foundation-courses', 'Certificate in Computer Applications', 'certificate-in-computer-applications',
   'Basic computer literacy — operating systems, internet and office tools.',
   'Covers computer fundamentals, Windows, internet basics, MS Word, MS Excel and MS PowerPoint. Suited for absolute beginners.',
   '3 months', 350000, 1),
  ('diploma-programs', 'Diploma in Computer Applications', 'diploma-in-computer-applications',
   'A comprehensive diploma covering office tools, internet and basic programming.',
   'DCA covers computer fundamentals, MS Office, internet & email, and an introduction to programming logic. Includes a project and certificate on completion.',
   '6 months', 650000, 2),
  ('diploma-programs', 'Advanced Diploma in Computer Applications', 'advanced-diploma-in-computer-applications',
   'DCA plus web design, database basics and advanced spreadsheets.',
   'ADCA builds on DCA with HTML/CSS, basic database concepts using MS Access, advanced Excel, and Tally fundamentals.',
   '12 months', 1200000, 3),
  ('office-and-accounting', 'Tally with GST', 'tally-with-gst',
   'Practical accounting and GST compliance using Tally Prime.',
   'Covers company creation, ledgers, vouchers, inventory, GST invoicing and returns, and bank reconciliation in Tally Prime.',
   '2 months', 450000, 4),
  ('design-and-multimedia', 'Diploma in Desktop Publishing (DTP)', 'diploma-in-desktop-publishing',
   'Page layout, typesetting and print-ready design.',
   'Covers CorelDRAW, Adobe Photoshop and Adobe InDesign fundamentals for print and digital publishing.',
   '4 months', 550000, 5)
) as v(category_slug, name, slug, short_description, description, duration_label, fee_paise, display_order)
join public.course_categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
