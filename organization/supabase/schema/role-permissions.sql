-- What a role may do on each page, beyond opening it.
--
-- roles.modules decides which pages a role may open. This adds
-- roles.permissions: { "<page path>": ["create","edit","delete","print",
-- "export","approve"] }. A page with no entry keeps every action, so running
-- this changes nobody's access until an administrator narrows a role on the
-- Access Control page.
--
-- Like modules, this is enforced by the app (buttons, menus and row actions
-- the role lacks are hidden or refused); the database's own row-level rules
-- still decide which centre's records anyone can touch at all.
--
-- Needs roles.sql first. Run once in the Supabase SQL editor. Safe to re-run.

do $$
begin
  if to_regclass('public.roles') is null then
    raise notice 'Run roles.sql first: there is no roles table to add permissions to.';
  else
    alter table public.roles
      add column if not exists permissions jsonb not null default '{}'::jsonb;
  end if;
end $$;

notify pgrst, 'reload schema';

select name, "baseRole", cardinality(modules) as pages, jsonb_typeof(permissions) as permissions
from public.roles
order by "organizationId", "isSystem" desc, name;
