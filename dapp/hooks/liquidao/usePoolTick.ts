import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { DaoLiquidityPool } from "../../lib/db/schema";
import { StateViewAbi } from "../../lib/contracts/v4router/StateViewAbi";
import { GATED_POOL_HOOK_ADDRESS } from "./helpers";
import { keccak256, encodeAbiParameters } from "viem";
import { createPoolKey } from "@/utils/v4";

// Utility function to compute price from tick
const computePriceFromTick = (tick: number): number => {
  return Math.pow(1.0001, tick);
};

// Utility function to compute pool ID from pool key
const computePoolId = (pool: DaoLiquidityPool): `0x${string}` => {
  const poolKey = createPoolKey({
    daoTokenAddress: pool.daoTokenAddress as `0x${string}`,
    liquidityTokenAddress: pool.liquidityTokenAddress as `0x${string}`,
    fee: pool.lpFee,
    tickSpacing: pool.tickSpacing,
    hooks: GATED_POOL_HOOK_ADDRESS,
  });

  return keccak256(
    encodeAbiParameters(
      [
        {
          name: "poolKey",
          type: "tuple",
          components: [
            { name: "currency0", type: "address" },
            { name: "currency1", type: "address" },
            { name: "fee", type: "uint24" },
            { name: "tickSpacing", type: "int24" },
            { name: "hooks", type: "address" },
          ],
        },
      ],
      [poolKey]
    )
  );
};

export interface PoolTickResult {
  status: "loading" | "success" | "error" | "idle";
  tick: number;
  sqrtPriceX96: bigint;
  protocolFee: number;
  lpFee: number;
  priceRatio: number;
  error?: string;
}

export const usePoolTick = (
  selectedPool: DaoLiquidityPool | undefined
): PoolTickResult => {
  const [result, setResult] = useState<PoolTickResult>({
    status: "idle",
    tick: 0,
    sqrtPriceX96: BigInt(0),
    protocolFee: 0,
    lpFee: 0,
    priceRatio: 1,
  });

  const {
    data: slot0Data,
    isLoading,
    isError,
    error,
  } = useReadContract({
    address: "0xe1dd9c3fa50edb962e442f60dfbc432e24537e4c", // StateView address
    abi: StateViewAbi,
    functionName: "getSlot0",
    args: selectedPool ? [computePoolId(selectedPool)] : undefined,
    query: {
      enabled: !!selectedPool,
    },
  });

  useEffect(() => {
    if (!selectedPool) {
      setResult({
        status: "idle",
        tick: 0,
        sqrtPriceX96: BigInt(0),
        protocolFee: 0,
        lpFee: 0,
        priceRatio: 1,
      });
      return;
    }

    if (isLoading) {
      setResult({
        status: "loading",
        tick: 0,
        sqrtPriceX96: BigInt(0),
        protocolFee: 0,
        lpFee: 0,
        priceRatio: 1,
      });
    } else if (isError) {
      setResult({
        status: "error",
        tick: 0,
        sqrtPriceX96: BigInt(0),
        protocolFee: 0,
        lpFee: 0,
        priceRatio: 1,
        error: error?.message || "Failed to fetch pool tick",
      });
    } else if (slot0Data !== undefined) {
      const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0Data;
      const tickNumber = Number(tick);
      const priceRatio = computePriceFromTick(tickNumber);

      setResult({
        status: "success",
        tick: tickNumber,
        sqrtPriceX96,
        protocolFee: Number(protocolFee),
        lpFee: Number(lpFee),
        priceRatio,
      });
    }
  }, [selectedPool, slot0Data, isLoading, isError, error]);

  return result;
};

export default usePoolTick;
