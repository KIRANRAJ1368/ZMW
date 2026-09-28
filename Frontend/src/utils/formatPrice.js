/**
 * Single source of truth for money formatting in the storefront.
 *
 * Product prices are owned by the Admin panel / database. The storefront must
 * never re-scale them (no FX conversion, no rounding multiplier) — it only
 * renders the stored amount as Indian Rupees. That keeps
 * Admin Price === Backend/Database Price === Frontend Price for every product.
 */

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_LOCALE = "en-IN";

const inrFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export function formatINRNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return inrFormatter.format(amount);
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  const formatted = formatINRNumber(value);
  return formatted === "" ? "" : `${CURRENCY_SYMBOL}${formatted}`;
}

export default formatPrice;
