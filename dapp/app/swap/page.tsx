"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { CheckCircle, Lock } from "lucide-react";
import { SwapForm } from "./components/SwapForm";
import { useEligibilityCheck } from "@/hooks/useEligibilityCheck";

const SuccessView = ({ resetSwap }: { resetSwap: () => void }) => (
  <div className="container mx-auto px-4 py-20">
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="card-title text-2xl justify-center mb-4">
            Swap Authorized!
          </h2>
          <p className="mb-6">
            Your swap for <strong>USDC</strong> has been authorized and
            executed.
          </p>

          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title">Transaction Hash</div>
              <div className="stat-value text-sm font-mono">0x1234...5678</div>
              <div className="stat-desc">View on Etherscan</div>
            </div>
          </div>

          <div className="card-actions justify-center">
            <button className="btn btn-primary" onClick={resetSwap}>
              Make Another Swap
            </button>
            <button className="btn btn-ghost">View Transaction</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotEligibleView = ({ resetSwap }: { resetSwap: () => void }) => (
  <div className="container mx-auto px-4 py-20">
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body text-center">
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="card-title text-2xl justify-center mb-4">
            Not Eligible
          </h2>
          <p className="mb-6 text-base">
            Your wallet address is not currently authorized to access any
            LiquiDAO pools. These pools are gated and only available to verified
            members.
          </p>

          <div className="alert alert-info mb-6">
            <div>
              <h4 className="font-semibold">Why am I not eligible?</h4>
              <ul className="text-sm mt-2 space-y-1 text-left">
                <li>• Your address is not in any DAO's approved list</li>
                <li>
                  • The pool you're trying to access hasn't been created yet
                </li>
                <li>• Your organization hasn't set up a LiquiDAO pool</li>
              </ul>

              <h4 className="font-semibold mt-2">What can you do?</h4>
              <div className="text-sm mt-2 space-y-2">
                <p>
                  • Contact your organization's admin to be added to the
                  eligible list
                </p>
                <p>• Check if your DAO has created a LiquiDAO pool</p>
                <p>
                  • Browse public pools on the{" "}
                  <a href="/pools" className="link link-primary">
                    Pools page
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title">Available Pools</div>
              <div className="stat-value text-2xl">0</div>
              <div className="stat-desc">No pools you can access</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Pools</div>
              <div className="stat-value text-2xl">3</div>
              <div className="stat-desc">Across all DAOs</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-actions justify-center space-x-4">
              <a href="/pools" className="btn btn-outline">
                View All Pools
              </a>
              <a href="/dao/create" className="btn btn-ghost">
                Create Pool
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CheckingEligibility = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <span className="loading loading-spinner loading-lg text-primary mb-6" />
    <h2 className="text-2xl font-semibold mb-2">Checking your eligibility…</h2>
    <p className="text-base opacity-70">
      Please wait while we verify if your wallet can access any LiquiDAO pools.
    </p>
  </div>
);

function SwapView() {
  const { status, eligiblePools, reset } = useEligibilityCheck();

  const [step, setStep] = useState<
    "loading" | "ready" | "success" | "not-eligible" | "rejected"
  >("loading");

  const resetSwap = () => {
    reset();
    setStep("loading");
  };

  useEffect(() => {
    if (status === "loading") {
      setStep("loading");
    } else if (status === "eligible") {
      setStep("ready");
    } else if (status === "not-eligible" || status === "error") {
      setStep("not-eligible");
    }
  }, [status]);

  if (step === "loading") {
    return <CheckingEligibility />;
  }

  if (step === "success") {
    return <SuccessView resetSwap={resetSwap} />;
  }

  if (step === "not-eligible") {
    return <NotEligibleView resetSwap={resetSwap} />;
  }
  return (
    <SwapForm
      onComplete={(result: boolean) => setStep(result ? "success" : "rejected")}
      eligiblePools={eligiblePools}
    />
  );
}

export default function SwapPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <SwapView />
    </div>
  );
}
