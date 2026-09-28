/**
 * Store-level commerce constants.
 *
 * These are expressed in the exact same unit as catalogue prices, which are
 * owned by the Admin panel / database. They live in a plain module (not the
 * React context) so that policy copy, banners and the cart all read the same
 * numbers without depending on a component.
 */

/** Cart subtotal at or above which shipping is free. */
export const FREE_SHIPPING_THRESHOLD = 75;

/** Flat shipping fee charged below the free-shipping threshold. */
export const SHIPPING_FEE = 15;

export default { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE };
