import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * New routes always start at the top. Same-page hash navigation keeps its
 * existing anchor behavior.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const previousRoute = useRef({ pathname, search });

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    const routeChanged =
      previousRoute.current.pathname !== pathname ||
      previousRoute.current.search !== search;

    if (routeChanged) {
      window.scrollTo(0, 0);
    } else if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }

    previousRoute.current = { pathname, search };
  }, [pathname, search, hash]);

  return null;
}
