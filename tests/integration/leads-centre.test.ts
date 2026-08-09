import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  hasCredentials,
  setupFixture,
  teardownFixture,
  type Fixture,
} from "./fixtures";

/**
 * Migration 0044: leads reach the centres. The pool stays invisible to
 * centre staff, assignment opens exactly one centre's view, and the WITH
 * CHECK stops a centre from moving a lead anywhere.
 */
describe.skipIf(!hasCredentials)("centre leads", () => {
  let fx: Fixture;
  let pooledLeadId: string;
  let assignedLeadId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const mkLead = async (tag: string, centreId: string | null) => {
      const { data, error } = await fx.admin
        .from("leads")
        .insert({
          organization_id: fx.orgId,
          full_name: `Lead ${tag} ${fx.suffix}`,
          phone: "9111111111",
          source: "test",
          centre_id: centreId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data.id as string;
    };

    pooledLeadId = await mkLead("pool", null);
    assignedLeadId = await mkLead("assigned", fx.centreId);
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin
      .from("leads")
      .delete()
      .in("id", [pooledLeadId, assignedLeadId]);
    await teardownFixture(fx);
  }, 120_000);

  it("a counsellor sees their centre's assigned leads and never the pool", async () => {
    const { data } = await fx.counsellor.cli
      .from("leads")
      .select("id")
      .in("id", [pooledLeadId, assignedLeadId]);
    expect((data ?? []).map((l: { id: string }) => l.id)).toEqual([
      assignedLeadId,
    ]);
  });

  it("faculty holds no lead permission at all", async () => {
    const { data } = await fx.faculty.cli
      .from("leads")
      .select("id")
      .in("id", [pooledLeadId, assignedLeadId]);
    expect(data ?? []).toHaveLength(0);
  });

  it("a counsellor works the lead's status but cannot reassign or release it", async () => {
    const { data: statusMove } = await fx.counsellor.cli
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", assignedLeadId)
      .select("status");
    expect(statusMove).toHaveLength(1);
    expect(statusMove![0].status).toBe("contacted");

    // Reassignment to the other centre: WITH CHECK refuses the new row.
    const { data: moved } = await fx.counsellor.cli
      .from("leads")
      .update({ centre_id: fx.otherCentreId })
      .eq("id", assignedLeadId)
      .select("id");
    expect(moved ?? []).toHaveLength(0);

    // Release back to the pool: same refusal.
    const { data: released } = await fx.counsellor.cli
      .from("leads")
      .update({ centre_id: null })
      .eq("id", assignedLeadId)
      .select("id");
    expect(released ?? []).toHaveLength(0);

    const { data: still } = await fx.admin
      .from("leads")
      .select("centre_id")
      .eq("id", assignedLeadId)
      .single();
    expect(still!.centre_id).toBe(fx.centreId);
  });

  it("the pool lead stays untouchable to centre staff even by id", async () => {
    const { data } = await fx.owner.cli
      .from("leads")
      .update({ status: "closed" })
      .eq("id", pooledLeadId)
      .select("id");
    expect(data ?? []).toHaveLength(0);
  });
});
