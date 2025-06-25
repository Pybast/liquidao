/**
 * Format an EVM address with different options
 * @param address The address to format
 * @param options Formatting options
 * @returns Formatted address
 */
export function formatAddress(
  address: string | undefined,
  options: {
    startChars?: number;
    endChars?: number;
    separator?: string;
    uppercase?: boolean;
  } = {}
): string {
  if (!address) return '';
  
  const {
    startChars = 6,
    endChars = 4,
    separator = '...',
    uppercase = false
  } = options;

  // Remove '0x' prefix if present
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  // Format the address
  const formatted = `${cleanAddress.slice(0, startChars)}${separator}${cleanAddress.slice(-endChars)}`;
  
  // Add back '0x' prefix
  const withPrefix = `0x${formatted}`;
  
  return uppercase ? withPrefix.toUpperCase() : withPrefix;
}

/**
 * Check if a string is a valid EVM address
 * @param address The address to check
 * @returns boolean indicating if the address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get ENS name if available, otherwise return formatted address
 * @param address The address to format
 * @param ensName Optional ENS name
 * @returns Formatted address or ENS name
 */
export function formatAddressOrEns(
  address: string | undefined,
  ensName?: string | null
): string {
  if (!address) return '';
  return ensName || formatAddress(address);
} 