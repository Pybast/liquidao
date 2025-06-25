import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GATED_POOL_HOOK_ADDRESS } from "./helpers";
import { GatedPoolHookAbi } from "./abis/GatedPoolHookAbi";
import { Hex } from "viem";
import { USDC_TOKEN_ADDRESS } from "@/environment";

const useCreateGatedPool = (
  daoTokenAddress: `0x${string}`,
  fee: number,
  initialTickSpacing: number,
  domainHash: Hex
): {
  createPool: (
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

  const createPool = async () => {
    try {
      await writeContractAsync({
        address: GATED_POOL_HOOK_ADDRESS,
        abi: GatedPoolHookAbi,
        functionName: "initializeGatedPool",
        args: [
          {
            currency0: daoTokenAddress,
            currency1: USDC_TOKEN_ADDRESS as `0x`,
            fee,
            tickSpacing: initialTickSpacing,
            hooks: GATED_POOL_HOOK_ADDRESS,
          },
          BigInt("79228162514264337593543950336"),
          domainHash,
        ],
      });
    } catch (error) {
      console.error("Error creating pool:", error);
      setStatus("error");
    }
  };

  return { createPool, status };
};

export default useCreateGatedPool;
