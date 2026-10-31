import { supabase } from "./client";

/**
 * System Settings > General, stored on the organisation's own row
 * (supabase/schema/organization-settings.sql).
 *
 * The institute's name and contact details are real columns on
 * `organizations` that the rest of the app (receipts, the recharge screen,
 * documents) already reads, so they are written there. Everything else is
 * kept in the `settings` jsonb column.
 */

export const NOTIFICATION_KEYS = ["email", "sms", "push", "fees", "exams", "attendance"] as const;

export interface GeneralSettings {
  schoolName: string;
  schoolCode: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  academicYear: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  notifications: Record<string, boolean>;
  twoFactor: boolean;
  sessionTimeout: string;
  passwordPolicy: boolean;
  accentColor: string;
  compact: boolean;
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  schoolName: "",
  schoolCode: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  academicYear: "",
  timezone: "ist",
  currency: "inr",
  dateFormat: "dd-mm-yyyy",
  notifications: Object.fromEntries(NOTIFICATION_KEYS.map((k) => [k, true])),
  twoFactor: false,
  sessionTimeout: "30",
  passwordPolicy: true,
  accentColor: "bg-blue-500",
  compact: false,
};

/** Where the page kept everything before it reached the database. Read once,
 *  as a fallback, so nothing an admin typed on this browser is lost. */
export const LEGACY_SETTINGS_KEY = "erp-settings-general";

/** Form field -> `organizations` column. */
const COLUMN_FIELDS = {
  schoolName: "name",
  email: "email",
  phone: "phone",
  address: "streetAddress",
  city: "city",
  state: "state",
  country: "country",
} as const satisfies Partial<Record<keyof GeneralSettings, string>>;

type ColumnField = keyof typeof COLUMN_FIELDS;
const isColumnField = (key: string): key is ColumnField => key in COLUMN_FIELDS;

const SETUP_HINT =
  "Organisation settings are not set up yet. Run supabase/schema/organization-settings.sql in Supabase.";

const missingColumn = (error: { code?: string; message?: string }) =>
  error.code === "42703" || error.code === "PGRST204" || /settings.*(does not exist|schema cache)/i.test(error.message || "");

function fail(error: { code?: string; message?: string }): never {
  throw new Error(missingColumn(error) ? SETUP_HINT : error.message || "Request failed");
}

export interface LoadedSettings {
  settings: GeneralSettings;
  /** True when the `settings` column held nothing yet -- the caller may then
   *  fold in the browser's old copy. */
  isEmpty: boolean;
}

type OrgRow = {
  name?: string | null;
  code?: string | null;
  email?: string | null;
  phone?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  settings?: Record<string, unknown> | null;
};

export async function getOrgSettings(organizationId: string): Promise<LoadedSettings> {
  const { data, error } = await supabase
    .from("organizations")
    .select('name, code, email, phone, "streetAddress", city, state, country, settings')
    .eq("id", organizationId)
    .maybeSingle();
  if (error) fail(error);
  const row = (data ?? {}) as OrgRow;
  const stored = row.settings && typeof row.settings === "object" ? row.settings : {};

  const settings: GeneralSettings = {
    ...DEFAULT_GENERAL_SETTINGS,
    ...(stored as Partial<GeneralSettings>),
    notifications: {
      ...DEFAULT_GENERAL_SETTINGS.notifications,
      ...((stored as Partial<GeneralSettings>).notifications ?? {}),
    },
    // The organisation's code is its unique key and seeds other numbering, so
    // the page never rewrites the column; it only shows it until one is saved.
    schoolCode: (stored as Partial<GeneralSettings>).schoolCode ?? row.code ?? "",
  };
  for (const [field, column] of Object.entries(COLUMN_FIELDS) as [ColumnField, keyof OrgRow][]) {
    const value = row[column];
    if (typeof value === "string" && value) settings[field] = value;
  }
  return { settings, isEmpty: Object.keys(stored).length === 0 };
}

export async function saveOrgSettings(organizationId: string, settings: GeneralSettings): Promise<void> {
  const update: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (isColumnField(key)) {
      // These columns are NOT NULL (and email is unique), so a blank field
      // leaves the stored value alone instead of failing the whole save.
      const text = typeof value === "string" ? value.trim() : "";
      if (text) update[COLUMN_FIELDS[key]] = text;
    } else {
      rest[key] = value;
    }
  }
  update.settings = rest;
  update.updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("organizations")
    .update(update)
    .eq("id", organizationId)
    .select("id");
  if (error) fail(error);
  // RLS hides a row it will not let you update; that comes back as no rows,
  // not as an error, and must not be reported as saved.
  if (!data || data.length === 0) throw new Error("You do not have permission to change this organisation's settings.");
}

/** The browser's old copy, if any. */
export function readLegacySettings(): Partial<GeneralSettings> | null {
  try {
    const raw = localStorage.getItem(LEGACY_SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as Partial<GeneralSettings>) : null;
  } catch {
    return null;
  }
}

export function clearLegacySettings() {
  try {
    localStorage.removeItem(LEGACY_SETTINGS_KEY);
  } catch {
    /* storage blocked: nothing to clear */
  }
}
