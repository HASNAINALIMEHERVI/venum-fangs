/**
 * Centralized currency formatting utility for Black Loom store.
 * Standardizes all price displays to "PKR X,XXX" format.
 */
export const formatCurrency = (amount) => {
  return `PKR ${Number(amount).toLocaleString()}`;
};
