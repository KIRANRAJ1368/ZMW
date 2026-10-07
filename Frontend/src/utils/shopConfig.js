/**
 * Store-level commerce constants.
 *
 * These are expressed in the exact same unit as catalogue prices, which are
 * owned by the Admin panel / database. They live in a plain module (not the
 * React context) so that policy copy, banners and the cart all read the same
 * numbers without depending on a component.
 */

/** Standard base shipping fee (calculated dynamically by delivery PIN code via Shiprocket). */
export const SHIPPING_FEE = 60;

/** Free shipping is disabled. Shipping is calculated solely by delivery PIN code. */
export const FREE_SHIPPING_THRESHOLD = Infinity;

export default { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE };
