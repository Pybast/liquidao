import { DaoLiquidityPool } from "@/lib/db/schema";
import { Coins, Mail, Shield } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSwapTokens } from "@/hooks/liquidao/useSwapTokens";
import { useAccount } from "wagmi";
import { formatAddress } from "@/utils/address";

const RenderTokenSelector = ({
  selectedPool,
  eligiblePools,
  setSelectedPool,
  label,
}: {
  selectedPool: DaoLiquidityPool | undefined;
  eligiblePools: DaoLiquidityPool[];
  setSelectedPool: Dispatch<SetStateAction<DaoLiquidityPool | undefined>>;
  label: string;
}) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text">{label}</span>
    </label>
    <div className="dropdown dropdown-bottom w-full">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-outline w-full justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{`🔶`}</span>
          <div className="text-left">
            <div className="font-semibold">{selectedPool?.daoTokenSymbol}</div>
            <div className="text-xs opacity-70">
              {selectedPool?.daoTokenName}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm">Balance</div>
          <div className="font-mono">{"?? Tokens"}</div>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full mt-1">
        {eligiblePools.map((pool) => (
          <li key={pool.poolId}>
            <a
              onClick={() => setSelectedPool(pool)}
              className="flex justify-between">
              <div className="flex items-center">
                <span className="text-xl mr-2">{`🔶`}</span>
                <div>
                  <div className="font-semibold">{pool.daoTokenSymbol}</div>
                  <div className="text-xs opacity-70">Pool: {pool.daoName}</div>
                  <div className="text-xs opacity-70">
                    ID: {formatAddress(pool.poolId)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">{"?? Tokens"}</div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export function SwapForm({
  onComplete,
  eligiblePools,
}: {
  onComplete(result: boolean): void;
  eligiblePools: DaoLiquidityPool[];
}) {
  const [selectedPool, setSelectedPool] = useState<
    DaoLiquidityPool | undefined
  >(undefined);
  const [amount, setAmount] = useState("");

  const { address } = useAccount();
  const { executeSwap, result } = useSwapTokens();

  const error = result.status === "error" ? new Error(result.error) : undefined;

  // Handle completion when transaction succeeds or fails
  useEffect(() => {
    if (result.status === "success") {
      onComplete(true);
    } else if (result.status === "error") {
      onComplete(false);
    }
  }, [result.status, onComplete]);

  const handleSubmitSwap = async () => {
    if (!selectedPool) {
      console.error("No pool selected");
      return;
    }

    if (!address) {
      console.error("No wallet connected");
      return;
    }

    const amountValue = Number.parseFloat(amount);
    if (amountValue <= 0) {
      console.error("Amount must be greater than 0");
      return;
    }

    await executeSwap({
      amount: amountValue,
      selectedPool,
      userAddress: address,
    });
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Secure Token Swap</h1>
          <p className="text-lg opacity-80">
            Private, MEV-protected swapping for verified employees
          </p>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="space-y-6">
              {/* From Token */}
              <RenderTokenSelector
                selectedPool={selectedPool}
                eligiblePools={eligiblePools}
                setSelectedPool={setSelectedPool}
                label={"From"}
              />

              {/* Amount Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                  <span className="label-text-alt">
                    Balance: {"??"} {selectedPool?.daoTokenSymbol}
                  </span>
                </label>
                <div className="join">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="input input-bordered join-item flex-1 text-right font-mono text-lg"
                  />
                  <button
                    className="btn btn-outline join-item"
                    onClick={
                      () => setAmount("0")
                      // TODO
                    }>
                    MAX
                  </button>
                </div>
              </div>

              {/* Estimated Output */}
              {amount && (
                <div className="alert alert-info">
                  <Coins className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">Estimated Output</h4>
                    <p>
                      ≈ {(Number.parseFloat(amount) * 1.02).toFixed(4)} USDC
                    </p>
                    <p className="text-xs opacity-70">
                      Rate includes MEV protection premium
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="alert alert-error">
                  <Shield className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">Oops...</h4>
                    <p className="text-sm">{error.message}</p>
                  </div>
                </div>
              )}

              {/* Success message */}
              {result.status === "success" && (
                <div className="alert alert-success">
                  <Shield className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">Swap Successful!</h4>
                    <p className="text-sm">
                      Your transaction has been completed
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleSubmitSwap}
                disabled={
                  !amount ||
                  !selectedPool ||
                  Number.parseFloat(amount) <= 0 ||
                  !address ||
                  result.status === "pending"
                }>
                {result.status === "pending"
                  ? "Processing..."
                  : "Initiate Verified Swap"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
