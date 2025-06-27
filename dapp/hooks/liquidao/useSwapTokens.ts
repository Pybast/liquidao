import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { V4_ROUTER_ADDRESS, GATED_POOL_HOOK_ADDRESS } from "./helpers";
import { v4RouterAbi } from "../../lib/contracts/v4router/v4RouterAbi";
import { DaoLiquidityPool } from "../../lib/db/schema";
import { parseUnits, encodeAbiParameters } from "viem";
import { generateMerkleTree, getMerkleProof } from "@/lib/merkle";
import { createPoolKey } from "@/utils/v4";

export interface SwapResult {
  status: "pending" | "success" | "idle" | "error";
  txData: any;
  error?: string;
}

export const useSwapTokens = (): {
  executeSwap: (args: {
    amount: number;
    selectedPool: DaoLiquidityPool;
    userAddress: `0x${string}`;
  }) => Promise<void>;
  result: SwapResult;
} => {
  const [result, setResult] = useState<SwapResult>({
    status: "idle",
    txData: null,
  });

  const { writeContractAsync, data, isPending } = useWriteContract();

  const {
    isLoading: isWaiting,
    isSuccess: isConfirmed,
    isError,
    data: txData,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isError) {
      setResult({
        status: "error",
        txData,
        error: txError?.message || "Transaction failed",
      });
    } else if (isPending || isWaiting) {
      setResult({
        status: "pending",
        txData,
      });
    } else if (isConfirmed) {
      setResult({
        status: "success",
        txData,
      });
    }
  }, [isPending, isWaiting, isConfirmed, isError, txData, txError]);

  const executeSwap = async (args: {
    amount: number;
    selectedPool: DaoLiquidityPool;
    userAddress: `0x${string}`;
  }) => {
    try {
      const { amount, selectedPool, userAddress } = args;

      // Convert amount to proper units based on token decimals
      const amountIn = parseUnits(
        amount.toString(),
        selectedPool.daoTokenDecimals
      );

      // Calculate minimum amount out (with 2% slippage tolerance)
      const amountOutMin = parseUnits(
        (amount * 0.5).toString(),
        selectedPool.liquidityTokenDecimals
      );

      // Determine swap direction - assuming DAO token is currency0 and liquidity token is currency1
      const zeroForOne = true; // swapping from DAO token (currency0) to liquidity token (currency1)

      // Construct the PoolKey
      const poolKey = createPoolKey({
        daoTokenAddress: selectedPool.daoTokenAddress as `0x${string}`,
        liquidityTokenAddress:
          selectedPool.liquidityTokenAddress as `0x${string}`,
        fee: selectedPool.lpFee,
        tickSpacing: selectedPool.tickSpacing,
        hooks: GATED_POOL_HOOK_ADDRESS,
      });

      // Set deadline to 20 minutes from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

      // Generate merkle proof for the user
      let hookData: `0x${string}` = "0x"; // default empty hookData

      try {
        // Fetch eligible addresses for this pool
        const response = await fetch(
          `/api/dao/addresses?daoTokenAddress=${selectedPool.daoTokenAddress}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            // Find the pool that matches our selectedPool
            const poolData = data.data.find(
              (pool: any) => pool.poolId === selectedPool.poolId
            );

            if (poolData && poolData.eligibleAddresses) {
              // Convert string addresses to 0x${string} format
              const eligibleAddresses = poolData.eligibleAddresses.map(
                (addr: string) => addr as `0x${string}`
              );

              // Generate merkle tree from eligible addresses
              const { merkleTree, merkleRoot } =
                generateMerkleTree(eligibleAddresses);

              // Generate proof for the current user
              const proof = await getMerkleProof(merkleTree, userAddress);

              // Encode the proof using abi.encode (equivalent to Solidity's abi.encode(proof))
              hookData = encodeAbiParameters(
                [{ name: "proof", type: "bytes32[]" }],
                [proof as `0x${string}`[]]
              ) as `0x${string}`;
            }
          }
        }
      } catch (error) {
        console.warn(
          "Failed to generate merkle proof, using empty hookData:",
          error
        );
        // Continue with empty hookData if proof generation fails
      }

      const swapArgs = [
        amountIn,
        amountOutMin,
        zeroForOne,
        poolKey,
        hookData, // encoded merkle proof or empty if generation failed
        userAddress,
        deadline,
      ] as const;

      console.log("Swap args:", swapArgs);

      await writeContractAsync({
        address: V4_ROUTER_ADDRESS,
        abi: v4RouterAbi,
        functionName: "swapExactTokensForTokens",
        args: swapArgs,
      });
    } catch (error) {
      console.error("Error executing swap:", error);
      setResult({
        status: "error",
        txData: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return { executeSwap, result };
};

export default useSwapTokens;
