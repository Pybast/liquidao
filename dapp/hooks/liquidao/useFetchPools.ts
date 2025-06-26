import { useEffect, useState } from "react";
import { GetDaoAddressesResponse, DaoPoolWithAddresses } from "@/lib/types/api";

/**
 * Custom hook to fetch all LiquiDAO pools from the backend API
 * @returns An object containing the pools, loading state, and error state
 */
export function useFetchPools() {
  const [pools, setPools] = useState<DaoPoolWithAddresses[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPools() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dao/addresses");
        if (!response.ok) {
          throw new Error(`Failed to fetch pools: ${response.statusText}`);
        }
        const result = (await response.json()) as GetDaoAddressesResponse;

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Malformed response from backend");
        }

        setPools(result.data);
        setError(null);
      } catch (err: any) {
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
