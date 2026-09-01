"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";

import {
  ACTIVE_CENTRE_COOKIE,
  listCentreMemberships,
} from "./current-membership";

export interface SelectCentreState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Switches which of the user's centres the portal is showing.
 *
 * The submitted id is checked against the caller's own memberships before the
 * cookie is written, so this cannot be used to point the portal at a centre
 * the user does not belong to. `getCurrentCentreContext` re-checks on every
 * read as well — the cookie is a preference, never a grant.
 */
export async function selectCentre(
  _prevState: SelectCentreState,
  formData: FormData,
): Promise<SelectCentreState> {
  const centreId = formData.get("centreId")?.toString() ?? "";
  if (!centreId) {
    return { status: "error", message: "Choose a centre." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const memberships = await listCentreMemberships(supabase, user.id);
  const chosen = memberships.find((m) => m.centreId === centreId);

  if (!chosen) {
    return {
      status: "error",
      message: "You do not belong to that centre.",
    };
  }

  (await cookies()).set(ACTIVE_CENTRE_COOKIE, centreId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });

  // Every centre page reads the context, so the whole portal is stale.
  revalidatePath("/centre", "layout");

  return { status: "success", message: `Now showing ${chosen.name}.` };
}
