/**
 * Currency code to symbol mapping.
 * Add new currency entries here manually as needed.
 * Keys are case-insensitive (matched via .toLowerCase()).
 */
const CURRENCY_SYMBOLS = {
  inr: "₹",   // Indian Rupee
  usd: "$",   // US Dollar
  idr: "Rp",  // Indonesian Rupiah
  eur: "€",   // Euro
  gbp: "£",   // British Pound
  aed: "د.إ", // UAE Dirham
  sgd: "S$",  // Singapore Dollar
  myr: "RM",  // Malaysian Ringgit
  thb: "฿",   // Thai Baht
  php: "₱",   // Philippine Peso
  vnd: "₫",   // Vietnamese Dong
};

/**
 * Returns the currency symbol for a given currency code.
 * Defaults to "$" if the code is not found.
 * @param {string} currencyCode - e.g. "inr", "USD", "idr"
 * @returns {string} - currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return "$";
  return CURRENCY_SYMBOLS[currencyCode.toLowerCase()] ?? "$";
};
