/**
 * Shared carousel arithmetic and responsive breakpoints.
 *
 * Kept free of React so the index traversal and the "does this row need a
 * carousel / arrows?" decision can be unit tested on their own. `useCarousel`
 * is a thin stateful wrapper around `stepIndex`.
 */

/** How many items a category carousel shows at each viewport size. */
export const CAROUSEL_BREAKPOINTS = {
  mobile: 2,
  tablet: 2,
  desktop: 3,
  wide: 4
};

/** Mirrors the CategoryFeatureGrid static-grid breakpoints so switching a
 *  row from grid to carousel does not change the tile size. */
export function visibleCountForWidth(width) {
  if (width <= 520) return CAROUSEL_BREAKPOINTS.mobile;
  if (width <= 820) return CAROUSEL_BREAKPOINTS.tablet;
  if (width <= 1100) return CAROUSEL_BREAKPOINTS.desktop;
  return CAROUSEL_BREAKPOINTS.wide;
}

/** Last reachable index, i.e. the slide that leaves the final item flush right. */
export function maxIndexFor(itemCount, visibleCount) {
  return Math.max(0, itemCount - visibleCount);
}

/**
 * Move `index` by `delta` (-1 = previous, 1 = next), wrapping around at both
 * ends so the arrows can always reach every item.
 */
export function stepIndex(index, delta, maxIndex) {
  if (maxIndex <= 0) return 0;
  if (delta >= 0) return index >= maxIndex ? 0 : Math.min(index + delta, maxIndex);
  return index <= 0 ? maxIndex : Math.max(index + delta, 0);
}

/** A row only needs a carousel once it overflows the visible window. */
export function shouldShowCarousel(itemCount, visibleCount) {
  return itemCount > visibleCount;
}

/** Arrows appear exactly when the carousel is active. */
export function shouldShowArrows(itemCount, visibleCount) {
  return shouldShowCarousel(itemCount, visibleCount);
}

/** Horizontal offset, in percent, of a slide at `index`. */
export function trackOffset(index, visibleCount) {
  if (visibleCount <= 0) return 0;
  return index * (100 / visibleCount);
}
