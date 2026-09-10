import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * When navigating with a hash (e.g. #most-loved-pieces, #whats-new-this-season),
 * smoothly scrolls directly to the target element.
 * When navigating between standard routes without a hash, instantly resets
 * scroll position to 0.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const scrollToSection = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };

      if (!scrollToSection()) {
        const timer1 = setTimeout(scrollToSection, 60);
        const timer2 = setTimeout(scrollToSection, 180);
        const timer3 = setTimeout(scrollToSection, 350);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      }
      return;
    }

    // Temporarily disable any CSS scroll-behavior so normal page reset is instant.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    window.scrollTo(0, 0);

    const id = requestAnimationFrame(() => {
      html.style.scrollBehavior = prev;
    });

    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  return null;
}