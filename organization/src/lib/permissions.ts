/**
 * What a role may do on a page, beyond opening it.
 *
 * A role's `modules` decide which pages it may open (View). Its `permissions`
 * narrow what it may do there: { "<page path>": ["create", "edit", …] }. A page
 * with no entry keeps every action -- which is how every role behaved before
 * permissions existed, so adding this changes nobody until an administrator
 * narrows a role on purpose.
 */

export const ACTIONS = ["create", "edit", "delete", "print", "export", "approve"] as const;
export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  print: "Print",
  export: "Export",
  approve: "Approve",
};

export type Permissions = Record<string, Action[]>;

/** The actions a role keeps on a page; every action when the page has no entry. */
export function actionsOn(permissions: Permissions | null | undefined, path: string): Action[] {
  const entry = permissions?.[path];
  return Array.isArray(entry) ? entry.filter((a): a is Action => (ACTIONS as readonly string[]).includes(a)) : [...ACTIONS];
}

export const allows = (permissions: Permissions | null | undefined, path: string, action: Action) =>
  actionsOn(permissions, path).includes(action);

/**
 * Which action a button or menu entry performs, read from its words. Checked
 * most specific first: "Download CSV" is an export, "Delete schedule" a
 * delete, "Update result" an edit. A plain "Save" is either adding or
 * changing, so it is let through by whichever of the two the role has.
 * Null means the control is not an action at all (a filter, a tab, Cancel).
 */
export function actionOf(label: string): Action | "save" | null {
  const text = label.replace(/\s+/g, " ").trim().toLowerCase();
  if (!text || text.length > 60) return null;
  if (/^(cancel|close|back|clear|reset|search|filter|view|open|show|hide|next|previous|continue|select all|copy)\b/.test(text)) return null;
  if (/\b(delete|remove|void|deactivate)\b/.test(text)) return "delete";
  if (/\b(approve|reject)\b/.test(text)) return "approve";
  if (/\b(export|csv|excel|xlsx)\b/.test(text)) return "export";
  if (/\b(print|pdf|download|reprint)\b/.test(text)) return "print";
  if (/^(edit|update|change|rename|reorder|move)\b/.test(text)) return "edit";
  if (/^(save|submit)\b/.test(text)) return "save";
  if (/^\+?\s*(add|new|create|collect|issue|generate|record|register|publish|upload|assign|mark|apply|book|schedule|send|recharge|load)\b/.test(text)) return "create";
  return null;
}

/** Whether a control with this label may be used on a page. */
export function labelAllowed(permissions: Permissions | null | undefined, path: string, label: string): boolean {
  const action = actionOf(label);
  if (!action) return true;
  if (action === "save") return allows(permissions, path, "create") || allows(permissions, path, "edit");
  return allows(permissions, path, action);
}
