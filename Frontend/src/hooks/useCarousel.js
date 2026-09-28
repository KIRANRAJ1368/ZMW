import { useCallback, useEffect, useRef, useState } from "react";
import { maxIndexFor, stepIndex } from "../utils/carouselCore";

/**
 * Stateful carousel index with wrap-around navigation and optional autoplay.
 *
 * Shared by the product carousels (New Arrivals / Best Sellers) and the
 * category subcategory rows so the arrow behaviour is identical everywhere.
 * Pass `autoDelayMs <= 0` for manual-only navigation.
 */
export default function useCarousel(itemsCount, visibleCount, autoDelayMs = 4000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const maxIndex = maxIndexFor(itemsCount, visibleCount);

  const next = useCallback(() => {
    setIndex((prev) => stepIndex(prev, 1, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((prev) => stepIndex(prev, -1, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (paused || autoDelayMs <= 0 || itemsCount <= visibleCount) return;
    timerRef.current = setInterval(next, autoDelayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, autoDelayMs, itemsCount, visibleCount]);

  useEffect(() => {
    setIndex(0);
  }, [itemsCount, visibleCount]);

  return { index, maxIndex, next, prev, setPaused };
}
