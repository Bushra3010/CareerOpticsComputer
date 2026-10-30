/**
 * After a new deploy, a tab opened before it still asks for the old build's
 * page files, which are gone: opening a page then showed a blank screen
 * ("Failed to fetch dynamically imported module") until the user refreshed.
 * Loading the page again picks up the new build. Once per half minute at most,
 * so a file that is truly missing cannot reload the tab in a loop.
 */
const KEY = "stale-build-reload-at";
const GAP_MS = 30_000;

export const isStaleChunkError = (reason: unknown) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \d+ failed/i.test(
    String((reason as { message?: string } | null)?.message ?? reason ?? ""),
  );

export function reloadForNewBuild(storage: Pick<Storage, "getItem" | "setItem"> = sessionStorage, reload = () => location.reload()) {
  let last = 0;
  try {
    last = Number(storage.getItem(KEY)) || 0;
  } catch {
    /* no storage: reload anyway, the gap cannot be kept */
  }
  if (Date.now() - last < GAP_MS) return false;
  try {
    storage.setItem(KEY, String(Date.now()));
  } catch {
    /* as above */
  }
  reload();
  return true;
}

export function watchForNewBuild() {
  // Vite's own signal that a preloaded file failed.
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadForNewBuild();
  });
  // A lazy page whose file is gone.
  window.addEventListener("unhandledrejection", (event) => {
    if (isStaleChunkError(event.reason)) reloadForNewBuild();
  });
  window.addEventListener("error", (event) => {
    if (isStaleChunkError(event.error ?? event.message)) reloadForNewBuild();
  });
}
