-- 0030: certificate.revoke belongs wherever certificate.issue does.
--
-- Migration 0029 seeded certificate.revoke but granted it to nobody except a
-- platform admin — the posture used for centre.manage/wallet.manage, where no
-- dedicated head-office role exists yet to hold them. Revocation is not that
-- case: correcting a certificate a centre issued in error (wrong course code,
-- wrong outcome) is squarely the same authority as issuing it, not a
-- head-office enforcement action over an entity that cannot be trusted with
-- itself — that is what centre.manage is for, and this is not it.
--
-- Found by the integration test written alongside 0029: it assumed
-- centre_owner could revoke a certificate they themselves issued, and the
-- assumption was wrong until now.

insert into public.role_permissions (role_id, permission_code)
select r.id, 'certificate.revoke'
from public.roles r
where r.code = 'centre_owner'
on conflict do nothing;
