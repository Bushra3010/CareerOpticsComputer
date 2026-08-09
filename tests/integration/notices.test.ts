import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  adminClient,
  anonKey,
  hasCredentials,
  PASSWORD,
  signIn,
  url,
  type AnyClient,
} from "./fixtures";

/**
 * Notices (migration 0043): the public-read window, the platform-admin
 * write boundary, and slug uniqueness. No tenant fixture needed — notices
 * hang off the organisation alone, so this suite builds only two users.
 */
describe.skipIf(!hasCredentials)("public notices", () => {
  const admin = adminClient();
  const suffix = crypto.randomUUID().slice(0, 6);
  let orgId: string;
  let platCli: AnyClient;
  let staffCli: AnyClient;
  const userIds: string[] = [];
  const noticeIds: string[] = [];

  const anonCli: AnyClient = createClient(url!, anonKey!);

  beforeAll(async () => {
    const { data: org } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", "career-optics")
      .single();
    orgId = org!.id;

    const mkUser = async (
      tag: string,
      platformAdmin: boolean,
    ): Promise<AnyClient> => {
      const email = `fx-notices-${tag}-${suffix}@example.test`;
      const { data: created } = await admin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
      });
      userIds.push(created!.user!.id);
      await admin.from("profiles").insert({
        id: created!.user!.id,
        full_name: `Notices ${tag}`,
        is_platform_super_admin: platformAdmin,
      });
      const cli: AnyClient = createClient(url!, anonKey!);
      await signIn(cli, email, "sign-in");
      return cli;
    };

    platCli = await mkUser("plat", true);
    staffCli = await mkUser("staff", false);
  }, 120_000);

  afterAll(async () => {
    if (noticeIds.length) {
      await admin.from("notices").delete().in("id", noticeIds);
    }
    for (const id of userIds) {
      await admin.from("profiles").delete().eq("id", id);
      await admin.auth.admin.deleteUser(id).catch(() => undefined);
    }
  }, 120_000);

  it("a platform admin creates drafts and publishes; the window governs anon reads", async () => {
    const mk = async (slug: string, patch: Record<string, unknown>) => {
      const { data, error } = await platCli
        .from("notices")
        .insert({
          organization_id: orgId,
          title: `Notice ${slug}`,
          slug: `${slug}-${suffix}`,
          body: "Body text long enough.",
          ...patch,
        })
        .select("id")
        .single();
      expect(error).toBeNull();
      noticeIds.push(data!.id);
      return data!.id as string;
    };

    const draftId = await mk("draft", { status: "draft" });
    const liveId = await mk("live", {
      status: "active",
      published_at: new Date().toISOString(),
    });
    const futureId = await mk("future", {
      status: "active",
      published_at: new Date(Date.now() + 86_400_000).toISOString(),
    });

    const { data: anonSees } = await anonCli
      .from("notices")
      .select("id")
      .in("id", [draftId, liveId, futureId]);
    expect((anonSees ?? []).map((n: { id: string }) => n.id)).toEqual([liveId]);

    // The detail page's exact query: published row by slug.
    const { data: bySlug } = await anonCli
      .from("notices")
      .select("id")
      .eq("slug", `live-${suffix}`)
      .eq("status", "active")
      .maybeSingle();
    expect(bySlug?.id).toBe(liveId);
  });

  it("a signed-in non-admin is a reader, not a writer", async () => {
    const { error: write } = await staffCli.from("notices").insert({
      organization_id: orgId,
      title: "Sneaky",
      slug: `sneaky-${suffix}`,
      body: "Should never land.",
      status: "active",
    });
    expect(write?.code).toBe("42501");

    // Reads exactly what anon reads — the live one, not the draft.
    const { data } = await staffCli
      .from("notices")
      .select("slug")
      .in("id", noticeIds);
    expect(data).toHaveLength(1);
    expect(data![0].slug).toBe(`live-${suffix}`);
  });

  it("slugs are unique per organisation", async () => {
    const { error } = await platCli.from("notices").insert({
      organization_id: orgId,
      title: "Duplicate",
      slug: `live-${suffix}`,
      body: "Same slug again.",
      status: "draft",
    });
    expect(error?.code).toBe("23505");
  });
});
