import { DaoLiquidityPool } from "@/lib/db/schema";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { GetDaoAddressesResponse, ApiErrorResponse } from "@/lib/types/api";

type EligibilityStatus = "loading" | "eligible" | "not-eligible" | "error";

interface UseEligibilityCheckReturn {
  status: EligibilityStatus;
  eligiblePools: DaoLiquidityPool[];
  checkEligibility: () => Promise<void>;
  reset: () => void;
}

export function useEligibilityCheck(): UseEligibilityCheckReturn {
  const { address } = useAccount();
  const [status, setStatus] = useState<EligibilityStatus>("loading");
  const [eligiblePools, setEligiblePools] = useState<DaoLiquidityPool[]>([]);

  const checkEligibility = async () => {
    if (!address) {
      setStatus("not-eligible");
      return;
    }

    try {
      setStatus("loading");
      const response = await fetch(
        `/api/dao/addresses?eligibleAddress=${address}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GetDaoAddressesResponse | ApiErrorResponse =
        await response.json();

      if (!result.success) {
        setEligiblePools([]);
        setStatus("not-eligible");
        return;
      }

      setEligiblePools(result.data);
      setStatus(result.data.length > 0 ? "eligible" : "not-eligible");
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setStatus("error");
      setEligiblePools([]);
    }
  };

  const reset = () => {
    setStatus("loading");
    setEligiblePools([]);
  };

  useEffect(() => {
    if (address) {
      checkEligibility();
    } else {
      setStatus("not-eligible");
    }
  }, [address]);

  return {
    status,
    eligiblePools,
    checkEligibility,
    reset,
  };
}
