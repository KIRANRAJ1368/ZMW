import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * Fires synchronously (useLayoutEffect) before the browser paints the new
 * route, so the page always starts at position 0 — no bottom-to-top scroll
 * animation is ever visible.
 *
 * Root cause note: CSS `scroll-behavior: smooth` on <html> causes even
 * programmatic window.scrollTo() calls to animate.  We guard against this by
 * temporarily overriding the inline style to "auto" before scrolling, then
 * restoring it afterwards — making this component resilient even if smooth
 * scrolling is re-introduced via a stylesheet in the future.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      // Hash links (e.g. #section) — let the browser handle these normally.
      return;
    }

    // Temporarily disable any CSS scroll-behavior so the scroll is instant.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    window.scrollTo(0, 0);

    // Restore in the next frame (after the instant scroll has been applied).
    const id = requestAnimationFrame(() => {
      html.style.scrollBehavior = prev;
    });

    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  return null;
}