import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { RPC_URL } from "@/environment";

const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
];

function isValidAddress(address?: string): address is `0x${string}` {
  return !!address && address.startsWith("0x") && address.length === 42;
}

export function useTokenInfos(tokenAddress?: `0x${string}`) {
  const [data, setData] = useState<{
    name: string;
    symbol: string;
    decimals: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidAddress(tokenAddress)) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    async function fetchTokenInfos() {
      setLoading(true);
      setError(null);
      try {
        const client = createPublicClient({ transport: http(RPC_URL) });
        const [name, symbol, decimals] = await Promise.all([
          client.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "name",
          }),
          client.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "symbol",
          }),
          client.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals",
          }),
        ]);
        if (!cancelled) {
          setData({
            name: name as string,
            symbol: symbol as string,
            decimals: decimals as number,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            "Failed to fetch token info, make sure it's a valid ERC20 token"
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTokenInfos();
    return () => {
      cancelled = true;
    };
  }, [tokenAddress]);

  return { data, loading, error };
}
