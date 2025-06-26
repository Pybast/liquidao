import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GATED_POOL_HOOK_ADDRESS } from "./helpers";
import { LiquiDAOHookAbi } from "../../lib/contracts/liquidao/LiquiDAOHookAbi";
import { Hex, Log, parseEventLogs } from "viem";

function getPoolData(logs: Log<bigint, number, false>[] | undefined) {
  if (logs === undefined) return undefined;

  const creationEvents = parseEventLogs({
    abi: LiquiDAOHookAbi,
    logs: logs,
  }).filter((log) => log.eventName === "VerificationParamsSetup");

  if (creationEvents.length !== 1)
    throw new Error("Pool creation event not found or found more than one");

  return creationEvents[0].args;
}

const useCreateLiquiDAOPool = (): {
  createPool: (args: {
    daoTokenAddress: `0x${string}`;
    liquidityTokenAddress: `0x${string}`;
    fee: number;
    initialTickSpacing: number;
    merkleRoot: Hex;
    owner: `0x${string}`;
  }) => Promise<void>;
  status: "pending" | "success" | "idle" | "error";
  poolData:
    | {
        poolId: Hex;
        merkleRoot: Hex;
        owner: `0x${string}`;
      }
    | undefined;
} => {
  const [status, setStatus] = useState<
    "pending" | "success" | "idle" | "error"
  >("idle");

  const { writeContractAsync, data, isPending } = useWriteContract();

  const {
    isLoading: isWaiting,
    isSuccess: isConfirmed,
    isError,
    data: txData,
  } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isError) {
      setStatus("error");
    }
    if (isPending || isWaiting) {
      setStatus("pending");
    } else if (isConfirmed) {
      setStatus("success");
    }
  }, [isPending, isWaiting, isConfirmed]);

  const createPool = async (args: {
    daoTokenAddress: `0x${string}`;
    liquidityTokenAddress: `0x${string}`;
    fee: number;
    initialTickSpacing: number;
    merkleRoot: Hex;
    owner: `0x${string}`;
  }) => {
    try {
      const _args = [
        {
          currency0: args.daoTokenAddress,
          currency1: args.liquidityTokenAddress,
          fee: args.fee,
          tickSpacing: args.initialTickSpacing,
          hooks: GATED_POOL_HOOK_ADDRESS,
        },
        BigInt("79228162514264337593543950336"), // TODO find better initial tick from public pool
        args.merkleRoot,
        args.owner,
      ] as const;

      console.log("args", _args);

      const tx = await writeContractAsync({
        address: GATED_POOL_HOOK_ADDRESS,
        abi: LiquiDAOHookAbi,
        functionName: "initializeLiquiDAOPool",
        args: _args,
      });
    } catch (error) {
      console.error("Error creating pool:", error);
      setStatus("error");
    }
  };

  const poolData = getPoolData(txData?.logs);

  return { createPool, status, poolData };
};

export default useCreateLiquiDAOPool;
