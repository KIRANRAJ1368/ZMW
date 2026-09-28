/**
 * Single source of truth for money formatting in the Admin panel.
 *
 * The value passed in is the exact amount stored in the database — the same
 * number the storefront and backend receive. Nothing here re-scales or converts
 * the value; it only renders it as Indian Rupees so the Admin panel, the API and
 * the storefront always show the identical figure.
 */

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_LOCALE = "en-IN";

const inrFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export function formatINRNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return inrFormatter.format(amount);
}

export function formatINR(value) {
  if (value === null || value === undefined || value === "") return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${formatINRNumber(value)}`;
}

export default formatINR;
