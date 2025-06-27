// Helper function to format balance in a human-readable way
export const formatBalance = (balance: number): string => {
  const num = balance;

  // If the number is very small (less than 0.0001), show scientific notation
  if (num > 0 && num < 0.0001) {
    return num.toExponential(2);
  }

  // If the number is very large (more than 1 million), format with K, M, B suffixes
  if (num >= 1000000) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }

  // For regular numbers, show up to 4 decimal places, but remove trailing zeros
  const formatted = num.toFixed(4);
  return formatted.replace(/\.?0+$/, "");
};
