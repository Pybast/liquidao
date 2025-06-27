import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { DaoLiquidityPool } from "../../lib/db/schema";

// ERC20 ABI for balanceOf function
const erc20Abi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface TokenBalanceResult {
  status: "loading" | "success" | "error" | "idle";
  balance: number;
  error?: string;
}

export const useTokenBalance = (
  selectedPool: DaoLiquidityPool | undefined
): TokenBalanceResult => {
  const { address } = useAccount();
  const [result, setResult] = useState<TokenBalanceResult>({
    status: "idle",
    balance: 0,
  });

  const {
    data: balanceData,
    isLoading,
    isError,
    error,
  } = useReadContract({
    address: selectedPool?.daoTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!selectedPool && !!address,
    },
  });

  useEffect(() => {
    if (!selectedPool || !address) {
      setResult({
        status: "idle",
        balance: 0,
      });
      return;
    }

    if (isLoading) {
      setResult({
        status: "loading",
        balance: 0,
      });
    } else if (isError) {
      setResult({
        status: "error",
        balance: 0,
        error: error?.message || "Failed to fetch balance",
      });
    } else if (balanceData !== undefined) {
      try {
        const rawBalance = parseFloat(
          formatUnits(balanceData, selectedPool.daoTokenDecimals)
        );
        setResult({
          status: "success",
          balance: rawBalance,
        });
      } catch (formatError) {
        setResult({
          status: "error",
          balance: 0,
          error: "Failed to format balance",
        });
      }
    }
  }, [selectedPool, address, balanceData, isLoading, isError, error]);

  return result;
};

export default useTokenBalance;
