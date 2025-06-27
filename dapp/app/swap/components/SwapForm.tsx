import { DaoLiquidityPool } from "@/lib/db/schema";
import { Coins, Shield, ChevronDown, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSwapTokens } from "@/hooks/liquidao/useSwapTokens";
import { useTokenBalance } from "@/hooks/liquidao/useTokenBalance";
import { usePoolTick } from "@/hooks/liquidao/usePoolTick";
import { useAccount } from "wagmi";
import { formatBalance } from "@/utils/balance";

const RenderTokenSelector = ({
  selectedPool,
  eligiblePools,
  setSelectedPool,
}: {
  selectedPool: DaoLiquidityPool | undefined;
  eligiblePools: DaoLiquidityPool[];
  setSelectedPool: Dispatch<SetStateAction<DaoLiquidityPool | undefined>>;
}) => (
  <div className="relative w-full">
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors min-w-[120px]"
      type="button">
      {/* <span className="text-2xl">🔶</span> */}
      <span className="font-semibold text-base">
        {selectedPool?.daoTokenSymbol || "Select"}
      </span>
      <ChevronDown className="w-4 h-4 opacity-60 ml-1" />
    </button>
    <div className="absolute left-0 z-10 w-full bg-neutral-900 rounded-xl shadow-lg border border-neutral-700 max-h-60 overflow-y-auto hidden group-hover:block">
      {eligiblePools.map((pool) => (
        <div
          key={pool.poolId}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-800"
          onClick={() => setSelectedPool(pool)}>
          {/* <span className="text-xl">🔶</span> */}
          <span className="font-semibold">{pool.daoTokenSymbol}</span>
          <span className="text-xs opacity-60 ml-2">{pool.daoTokenName}</span>
        </div>
      ))}
    </div>
  </div>
);

export function SwapForm({
  onComplete,
  eligiblePools,
}: {
  onComplete(result: { success: boolean; txHash?: string }): void;
  eligiblePools: DaoLiquidityPool[];
}) {
  const [selectedPool, setSelectedPool] = useState<
    DaoLiquidityPool | undefined
  >(undefined);
  const [amount, setAmount] = useState("");

  const { address } = useAccount();
  const { executeSwap, result } = useSwapTokens();
  const { balance, status: balanceStatus } = useTokenBalance(selectedPool);
  const { priceRatio, status: tickStatus } = usePoolTick(selectedPool);

  const error = result.status === "error" ? new Error(result.error) : undefined;

  useEffect(() => {
    if (result.status === "success") {
      // Extract transaction hash from the transaction data
      const txHash = result.txData?.transactionHash || result.txData?.hash;
      onComplete({ success: true, txHash });
    } else if (result.status === "error") {
      onComplete({ success: false });
    }
  }, [result.status, result.txData, onComplete]);

  const handleSubmitSwap = async () => {
    if (!selectedPool) return;
    if (!address) return;
    const amountValue = Number.parseFloat(amount);
    if (amountValue <= 0) return;
    await executeSwap({
      amount: amountValue,
      selectedPool,
      userAddress: address,
    });
  };

  const useMaxAmount = () => {
    if (balanceStatus === "success") {
      setAmount(balance.toString());
    }
  };

  const renderBalance = () => {
    if (balanceStatus === "loading") {
      return (
        <span className="text-neutral-500 text-xs flex items-center gap-1">
          Balance: <Loader2 className="w-3 h-3 animate-spin" />
        </span>
      );
    } else if (balanceStatus === "error") {
      return (
        <span className="text-neutral-500 text-xs">
          Balance: <span className="font-mono">Error</span>{" "}
          {selectedPool?.daoTokenSymbol}
        </span>
      );
    } else if (balanceStatus === "success") {
      return (
        <span className="text-neutral-500 text-xs">
          Balance: <span className="font-mono">{formatBalance(balance)}</span>{" "}
          {selectedPool?.daoTokenSymbol}
        </span>
      );
    } else {
      return (
        <span className="text-neutral-500 text-xs">
          Balance: <span className="font-mono">--</span>{" "}
          {selectedPool?.daoTokenSymbol}
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 px-2">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white drop-shadow">
          Swap with LiquiDAO.
        </h1>
        <div className="bg-neutral-900 rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-neutral-800">
          {/* FROM */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-neutral-400 text-sm">From</span>
              {renderBalance()}
            </div>
            <div className="flex items-center gap-2 bg-neutral-800 rounded-xl px-4 py-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent outline-none text-2xl font-mono flex-1 text-white placeholder:text-neutral-500"
                style={{ minWidth: 0 }}
              />
              <button
                className="text-xs px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-semibold"
                onClick={useMaxAmount}
                type="button">
                MAX
              </button>
              <div className="relative group ml-2">
                <RenderTokenSelector
                  selectedPool={selectedPool}
                  eligiblePools={eligiblePools}
                  setSelectedPool={setSelectedPool}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center my-2">
            <div className="h-7 w-7 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
              <svg width="18" height="18" fill="none" viewBox="0 0 16 16">
                <path
                  d="M8 3v10m0 0l-3-3m3 3l3-3"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* TO (output) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-neutral-400 text-sm">To</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-800 rounded-xl px-4 py-3">
              <input
                type="text"
                value={
                  amount && tickStatus === "success"
                    ? (Number.parseFloat(amount) * priceRatio).toFixed(4)
                    : tickStatus === "loading"
                    ? "Loading..."
                    : "0.0000"
                }
                readOnly
                className="bg-transparent outline-none text-2xl font-mono flex-1 text-white placeholder:text-neutral-500"
                style={{ minWidth: 0 }}
              />
              <span className="font-semibold text-base text-white ml-2">
                USDC
              </span>
            </div>
          </div>

          {/* Estimated Output */}
          {amount && tickStatus === "success" && (
            <div className="flex justify-center">
              <div className="rounded-xl border border-cyan-500 bg-cyan-900/30 px-4 py-2 flex items-center gap-2 w-full max-w-xs">
                <Coins className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-cyan-200 text-sm whitespace-nowrap">
                  Estimated Output
                </span>
                <span className="font-mono text-cyan-100 text-base ml-2 whitespace-nowrap">
                  ≈ {(Number.parseFloat(amount) * priceRatio).toFixed(4)} USDC
                </span>
              </div>
            </div>
          )}

          {/* Loading state for price */}
          {amount && tickStatus === "loading" && (
            <div className="flex justify-center">
              <div className="rounded-xl border border-cyan-500 bg-cyan-900/30 px-4 py-2 flex items-center gap-2 w-full max-w-xs">
                <Coins className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-cyan-200 text-sm">
                  Loading Price...
                </span>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-auto" />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="rounded-xl border border-red-500 bg-red-900/30 px-4 py-2 flex items-center gap-2 w-full max-w-xs">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-200 text-sm">
                  Oops...
                </span>
                <span className="text-sm text-red-100 ml-2">
                  {error.message}
                </span>
              </div>
            </div>
          )}

          {/* Success message */}
          {result.status === "success" && (
            <div className="flex justify-center">
              <div className="rounded-xl border border-green-500 bg-green-900/30 px-4 py-2 flex items-center gap-2 w-full max-w-xs">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-200 text-sm">
                  Swap Successful!
                </span>
                <span className="text-sm text-green-100 ml-2">
                  Your transaction has been completed
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-bold shadow-lg hover:from-cyan-400 hover:to-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitSwap}
            disabled={
              !amount ||
              !selectedPool ||
              Number.parseFloat(amount) <= 0 ||
              !address ||
              result.status === "pending" ||
              tickStatus === "loading"
            }>
            {result.status === "pending"
              ? "Processing..."
              : "Initiate Verified Swap"}
          </button>
        </div>
      </div>
    </div>
  );
}
