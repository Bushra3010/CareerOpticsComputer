-- 0047: drops the seven-argument `post_payment`.
--
-- Adding `p_idempotency_key` in 0046 did not replace the old function — a
-- different argument list makes a NEW function, so both now exist. PostgREST
-- refuses to call a name with ambiguous overloads, which would take fee
-- collection down entirely. The same trap migration 0038 hit with
-- `add_ticket_message`.
--
-- Dropping the old signature loses nothing: the new one defaults
-- `p_idempotency_key` to null, so an existing seven-argument call still
-- resolves — it simply gets no replay protection until the caller supplies
-- a key.

drop function if exists public.post_payment(
  uuid, uuid, uuid, uuid, bigint, public.payment_method, text
);
