"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatAddress } from "@/utils/address";

interface CopyableAddressProps {
  address: string;
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
  onCopy?: (address: string) => void;
}

export default function CopyableAddress({
  address,
  showIcon = true,
  className = "",
  children,
  onCopy,
}: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.(address);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`hover:opacity-80 transition-opacity flex items-center gap-1 ${className}`}
      title="Click to copy address">
      {children || formatAddress(address)}
      {showIcon &&
        (copied ? (
          <Check className="w-3 h-3 text-success" />
        ) : (
          <Copy className="w-3 h-3" />
        ))}
    </button>
  );
}
