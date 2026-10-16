/** The API stores prices as plain numbers; the currency sign is display-only. */
const CURRENCY_SYMBOL = "$";

export const formatPrice = (amount: number) =>
  `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
