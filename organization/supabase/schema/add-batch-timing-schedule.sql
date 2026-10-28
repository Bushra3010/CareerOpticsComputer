-- What a batch timing is, beyond a start and an end.
--
-- The timetable screen asks four things the table cannot answer: whether the
-- class runs in the room or online, when the break falls inside a long
-- session, and what colour to draw it on the weekly grid so one batch can be
-- picked out from another at a glance.
--
-- The column is `classMode`, not `mode`: PostgREST parses `mode` as the
-- ordered-set aggregate and answers a plain select on it with 42809.
--
-- Notes are deliberately absent: `description` already exists on this table
-- and is exactly that field.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The screen degrades
-- gracefully until it is: timings still read, save and show on the grid,
-- without the mode, the break or the colour.
alter table public.batch_timings
  add column if not exists "classMode" text,
  add column if not exists "breakStart" text,
  add column if not exists "breakEnd" text,
  add column if not exists "colour" text;
