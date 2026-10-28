export function optimizeWebsite(
  dir: string,
  options?: { supabaseUrl?: string },
): Promise<{ pages: number; stylesheets: number; icons: number; keptTailwindCdn: number }>;
