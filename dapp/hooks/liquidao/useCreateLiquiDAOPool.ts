import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GATED_POOL_HOOK_ADDRESS } from "./helpers";
import { LiquiDAOHookAbi } from "./abis/LiquiDAOHookAbi";
import { Hex } from "viem";

const useCreateLiquiDAOPool = (): {
  createPool: (
    args: {
      daoTokenAddress: `0x${string}`;
      liquidityTokenAddress: `0x${string}`;
      fee: number;
      initialTickSpacing: number;
      merkleRoot: Hex;
      owner: `0x${string}`;
    },
    cb: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>;
  status: "pending" | "success" | "idle" | "error";
} => {
  const [status, setStatus] = useState<
    "pending" | "success" | "idle" | "error"
  >("idle");

  const { writeContractAsync, data, isPending } = useWriteContract();

  const { isLoading: isWaiting, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
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

      await writeContractAsync({
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

  return { createPool, status };
};

export default useCreateLiquiDAOPool;
