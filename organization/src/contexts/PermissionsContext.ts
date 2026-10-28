import { createContext, useContext } from "react";
import type { Permissions } from "@/lib/permissions";

/**
 * The signed-in role's action permissions, provided by AuthProvider. Kept
 * apart from AuthContext so shared components (the data table) can read it
 * without needing the whole auth state -- outside a provider it is null,
 * which means no limits.
 */
export const PermissionsContext = createContext<Permissions | null>(null);

export const usePermissionsOrNull = () => useContext(PermissionsContext);
