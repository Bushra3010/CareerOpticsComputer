-- 0047: makes batch placement possible at all. Found by 0046's integration
-- suite, not by inspection: `enrolments` has carried a table-level UPDATE
-- grant since 0007 and has never had an UPDATE *policy*, so with RLS forced
-- every update was refused — silently, as zero rows. Nothing had noticed
-- because nothing had ever needed to edit an enrolment.
--
-- Rather than open the whole row, the privilege is narrowed to the single
-- column placement writes. RLS decides WHO may update; the column grant
-- decides WHAT, so this policy can never become a way to change a
-- student's course or resurrect a withdrawn enrolment — those are separate
-- operations that will want their own audited functions.

revoke update on public.enrolments from authenticated;
grant update (batch_id) on public.enrolments to authenticated;

-- `batch.manage` rather than a student permission: placing a student is an
-- act on the batch (its capacity is the constraint), and the matrix gives
-- exactly Centre Owner, Centre Manager and HO Operator that code.
create policy enrolments_place_in_batch on public.enrolments
  for update to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('batch.manage', organization_id)
    or (app.has_permission('batch.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('batch.manage', organization_id)
    or (app.has_permission('batch.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );
