import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to the returned ref and flips `visible`
 * to true the first time the element crosses the given threshold. Used to
 * drive the shared `.reveal` / `.is-visible` CSS pair instead of animating
 * everything on mount (which reads as noisy rather than intentional).
 *
 * @param {Object} options
 * @param {number} options.threshold - fraction of element visible to trigger (0-1)
 * @param {string} options.rootMargin - standard IntersectionObserver rootMargin
 * @param {boolean} options.once - disconnect after first reveal (default true)
 */
export default function useScrollReveal({
  threshold = 0.18,
  rootMargin = "0px 0px -8% 0px",
  once = true,
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Respect users who've asked for less motion: reveal immediately.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, visible];
}
