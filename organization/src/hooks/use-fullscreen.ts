import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Puts one element of the page into the browser's full screen, and tracks
 * whether it is there -- Escape leaves full screen without going through us,
 * so the state follows the browser's event rather than the button.
 */
export function useFullscreen(target: RefObject<HTMLElement>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.fullscreenElement === target.current && target.current !== null);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [target]);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await target.current?.requestFullscreen();
    } catch {
      // Refused (an embedded page, an old browser): the page stays as it was.
    }
  }, [target]);

  return { active, toggle, supported: typeof document !== "undefined" && document.fullscreenEnabled };
}
