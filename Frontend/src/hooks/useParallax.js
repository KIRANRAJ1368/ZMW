import { useEffect, useRef, useState } from "react";

/**
 * useParallax
 * Returns a ref and a pixel offset that tracks how far the attached
 * element's own bounding box has scrolled past the viewport, scaled by
 * `speed`. Reads scroll position inside a single shared rAF loop rather
 * than a scroll-event listener per component, so many parallax layers on
 * one page stay cheap.
 *
 * @param {number} speed - 0 = static, 0.2-0.4 = subtle, 1 = moves with scroll
 */
export default function useParallax(speed = 0.25) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return undefined;

    let frame = null;

    const update = () => {
      frame = null;
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
      setOffset(distanceFromCenter * speed * -1);
    };

    const requestUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return [ref, offset];
}
