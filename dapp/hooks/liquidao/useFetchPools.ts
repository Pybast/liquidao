import { useEffect, useState } from "react";
import { createPublicClient, decodeEventLog, http, parseAbiItem } from "viem";
import { GATED_POOL_HOOK_ADDRESS } from "./helpers";
import { sepolia } from "viem/chains";
import { DAO_MAPPING, Pool } from "../../lib/daoMapping";
import { RPC_URL } from "@/environment";

// ABI for the event we want to listen to
const eventAbi = parseAbiItem(
  "event VerificationParamsSetup(bytes32 poolId, bytes32 domainHash)"
);

/**
 * Custom hook to fetch all LiquiDAO pools from the GatedPoolHook contract
 * @returns An object containing the pools, loading state, and error state
 */
export function useFetchPools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPools() {
      try {
        setIsLoading(true);

        // Create a public client to interact with the blockchain
        const client = createPublicClient({
          chain: sepolia,
          transport: http(RPC_URL),
        });

        // Fetch all VerificationParamsSetup events
        const logs = await client.getLogs({
          address: GATED_POOL_HOOK_ADDRESS,
          event: eventAbi,
          fromBlock: BigInt(8449258), // Start from genesis block
        });

        // Transform logs into GatedPool objects
        const fetchedPools = logs.map((log) => {
          // Properly decode the event log to ensure args are defined
          const decodedLog = decodeEventLog({
            abi: [eventAbi],
            data: log.data,
            topics: log.topics,
          });

          const dao = DAO_MAPPING.find(
            (d) =>
              d.tokenAddress.toLowerCase() ==
              decodedLog.args.domainHash.toLowerCase() // TODO update to new event
          )!;

          return {
            ...dao,
            poolId: decodedLog.args.poolId as string,
          } satisfies Pool;
        });

        setPools(fetchedPools);
        setError(null);
      } catch (err) {
        console.error("Error fetching pools:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch pools")
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPools();
  }, []);

  return { pools, isLoading, error };
}
