"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import {
  Building2,
  Coins,
  Shield,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
} from "lucide-react";
import useCreateLiquiDAOPool from "@/hooks/liquidao/useCreateLiquiDAOPool";
import { Address, encodeAbiParameters, keccak256 } from "viem";
import Link from "next/link";
import { useAccount } from "wagmi";
import { generateMerkleTree } from "@/lib/merkle";
import { USDC_TOKEN_ADDRESS } from "@/environment";
import { useTokenInfos } from "@/hooks/getTokenInfos";
import { GATED_POOL_HOOK_ADDRESS } from "@/hooks/liquidao/helpers";
import CopyableAddress from "@/components/CopyableAddress";
import { createPoolKey } from "@/utils/v4";

interface PoolCreationParams {
  daoName: string;
  daoTokenAddress: Address;
  liquidityTokenAddress: Address;
  eligibleAddresses: Address[];
  tickSpacing: number;
  lpFee: number;
}

function computePoolId({
  daoTokenAddress,
  liquidityTokenAddress,
  lpFee,
  tickSpacing,
  hoook,
}: {
  daoTokenAddress: Address;
  liquidityTokenAddress: Address;
  lpFee: number;
  tickSpacing: number;
  hoook: Address;
}) {
  // Compute pool ID by hashing the concatenated pool parameters using viem
  // This mirrors the Solidity keccak256 hashing of the PoolKey struct
  const poolKey = createPoolKey({
    daoTokenAddress,
    liquidityTokenAddress,
    fee: lpFee,
    tickSpacing: tickSpacing,
    hooks: hoook,
  });

  // Use viem's encodePacked to match Solidity abi.encode
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
}

export default function CreateDAOPage() {
  const [formData, setFormData] = useState<PoolCreationParams>({
    daoName: "",
    daoTokenAddress: "" as `0x${string}`,
    liquidityTokenAddress: USDC_TOKEN_ADDRESS as Address,
    eligibleAddresses: [],
    tickSpacing: 1,
    lpFee: 0,
  });
  const { address } = useAccount();

  const [addressListInput, setAddressListInput] = useState("");

  const [submitting, setIsSubmitting] = useState(false);

  const { createPool, status, poolData } = useCreateLiquiDAOPool();
  const isSubmitting = submitting || status === "pending";

  const daoTokenInfo = useTokenInfos(formData.daoTokenAddress);
  const liquidityTokenInfo = useTokenInfos(formData.liquidityTokenAddress);

  useEffect(() => {
    if (status === "success") {
      savePoolData();
    }
  }, [status]);

  const savePoolData = async () => {
    if (!daoTokenInfo.data || !liquidityTokenInfo.data) return;

    const response = await fetch("/api/dao/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        daoName: formData.daoName,
        poolId: computePoolId({
          daoTokenAddress: formData.daoTokenAddress,
          liquidityTokenAddress: formData.liquidityTokenAddress,
          lpFee: formData.lpFee,
          tickSpacing: formData.tickSpacing,
          hoook: GATED_POOL_HOOK_ADDRESS,
        }),
        poolOwner: address,
        eligibleAddresses: formData.eligibleAddresses,
        daoTokenAddress: formData.daoTokenAddress,
        daoTokenName: daoTokenInfo.data.name,
        daoTokenSymbol: daoTokenInfo.data.symbol,
        daoTokenDecimals: daoTokenInfo.data.decimals,
        liquidityTokenAddress: formData.liquidityTokenAddress,
        liquidityTokenName: liquidityTokenInfo.data.name,
        liquidityTokenSymbol: liquidityTokenInfo.data.symbol,
        liquidityTokenDecimals: liquidityTokenInfo.data.decimals,
        tickSpacing: formData.tickSpacing,
        lpFee: formData.lpFee,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to save address list:", errorData);
      // You might want to show an error message to the user here
      // but still allow the pool creation to be considered successful
    } else {
      const result = await response.json();
      console.log("Address list saved successfully:", result);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.daoName ||
      !formData.daoTokenAddress ||
      formData.eligibleAddresses.length === 0 ||
      !formData.liquidityTokenAddress ||
      formData.tickSpacing === undefined ||
      formData.lpFee === undefined
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!daoTokenInfo.data || !liquidityTokenInfo.data) {
      alert("Fetching token info...");
      return;
    }

    setIsSubmitting(true);

    if (!address) {
      alert("Please connect your wallet");
      return;
    }

    const { merkleRoot } = generateMerkleTree(formData.eligibleAddresses);

    try {
      // Create the pool first
      await createPool({
        daoTokenAddress: formData.daoTokenAddress,
        liquidityTokenAddress: formData.liquidityTokenAddress,
        fee: formData.lpFee,
        initialTickSpacing: formData.tickSpacing,
        merkleRoot: merkleRoot,
        owner: address,
      });
    } catch (error) {
      console.error("Error during pool creation or address saving:", error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof PoolCreationParams,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressListChange = (value: string) => {
    setAddressListInput(value);
    console.log("value", value);
    // Parse addresses from textarea (one per line)
    const addresses = Array.from(
      new Set(
        value
          .split("\n")
          .map((addr) => addr.trim())
          .filter((addr) => addr.length > 0)
      )
    );
    setFormData((prev) => ({
      ...prev,
      eligibleAddresses: addresses as Address[],
    }));
  };

  if (status === "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="card-title text-3xl justify-center mb-4">
                  LiquiDAO Pool Created Successfully!
                </h2>
                <p className="text-lg mb-6">
                  Your private liquidity pool for{" "}
                  <strong>{formData.daoName}</strong> has been created. Only
                  addresses in your eligible list can now access the pool.
                </p>

                <div className="stats shadow mb-6">
                  <div className="stat">
                    <div className="stat-title">Pool ID</div>
                    <div className="stat-value text-sm font-mono">
                      {poolData ? (
                        <CopyableAddress address={poolData.poolId}>
                          {poolData.poolId}
                        </CopyableAddress>
                      ) : (
                        "Loading..."
                      )}
                    </div>
                    <div className="stat-desc">Unique pool identifier</div>
                  </div>
                </div>

                <div className="alert alert-success mb-6">
                  <CheckCircle className="w-5 h-5" />
                  <div className="text-left">
                    <h4 className="font-semibold">Pool Details:</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>
                        • {formData.eligibleAddresses.length} eligible addresses
                      </li>
                      <li>• {formData.lpFee}% LP fee</li>
                      <li>• Tick spacing: {formData.tickSpacing}</li>
                      <li>
                        • Token pair: {daoTokenInfo.data?.symbol || "DAO Token"}
                        /USDC
                      </li>
                      {poolData && (
                        <>
                          <li>
                            • Merkle root:{" "}
                            <CopyableAddress
                              address={poolData.merkleRoot}
                              className="text-xs">
                              {poolData.merkleRoot}
                            </CopyableAddress>
                          </li>
                          <li>
                            • Pool owner:{" "}
                            <CopyableAddress
                              address={poolData.owner}
                              className="text-xs">
                              {poolData.owner}
                            </CopyableAddress>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="card-actions justify-center mt-6">
                  <Link href="/pools" className="btn btn-accent">
                    View Pools
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Create LiquiDAO Pool</h1>
            <p className="text-lg opacity-80">
              Set up a private liquidity pool with access control for your DAO
            </p>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              {/* Error message for unexpected errors */}
              {status === "error" && (
                <div className="alert alert-error mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">
                      An unexpected error occurred
                    </h4>
                    <p className="text-sm">
                      Something went wrong during pool creation. Please try
                      again or check your input values.
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - DAO & Token Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-primary" />
                      DAO Information
                    </h3>

                    <div className="form-control">
                      <label className="label mb-2">
                        <span className="label-text font-semibold">
                          DAO Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your DAO name"
                        className="input input-bordered w-full"
                        value={formData.daoName}
                        onChange={(e) =>
                          handleInputChange("daoName", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label mb-2">
                        <span className="label-text font-semibold">
                          DAO Token Address *
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="0x..."
                        className="input input-bordered w-full font-mono"
                        value={formData.daoTokenAddress}
                        onChange={(e) =>
                          handleInputChange(
                            "daoTokenAddress",
                            e.target.value as `0x${string}`
                          )
                        }
                        required
                      />
                      {/* Token Info Display */}
                      <div className="mt-2 text-xs text-gray-500 min-h-[1.5em]">
                        {daoTokenInfo.loading && (
                          <span>Fetching token info...</span>
                        )}
                        {daoTokenInfo.error && (
                          <span className="text-error">
                            {daoTokenInfo.error}
                          </span>
                        )}
                        {daoTokenInfo.data && (
                          <span>
                            Name: {daoTokenInfo.data.name} | Symbol:{" "}
                            {daoTokenInfo.data.symbol} | Decimals:{" "}
                            {daoTokenInfo.data.decimals}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-control relative group">
                      <label className="label mb-2">
                        <span className="label-text font-semibold">
                          Liquidity Token Address (USDC)
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full font-mono cursor-not-allowed"
                        value={formData.liquidityTokenAddress}
                        readOnly
                        tabIndex={-1}
                        aria-label="Liquidity Token Address (USDC)"
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-base-200 text-xs px-2 py-1 rounded shadow z-10">
                        Locked to USDC
                      </div>
                      {/* Token Info Display */}
                      <div className="mt-2 text-xs text-gray-500 min-h-[1.5em]">
                        {liquidityTokenInfo.loading && (
                          <span>Fetching token info...</span>
                        )}
                        {liquidityTokenInfo.error && (
                          <span className="text-error">
                            {liquidityTokenInfo.error}
                          </span>
                        )}
                        {liquidityTokenInfo.data && (
                          <span>
                            Name: {liquidityTokenInfo.data.name} | Symbol:{" "}
                            {liquidityTokenInfo.data.symbol} | Decimals:{" "}
                            {liquidityTokenInfo.data.decimals}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-accent" />
                      Pool Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control relative group">
                        <label className="label mb-2">
                          <span className="label-text font-semibold">
                            Tick Spacing
                          </span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full cursor-not-allowed"
                          value={formData.tickSpacing}
                          // readOnly
                          onChange={(e) =>
                            handleInputChange(
                              "tickSpacing",
                              Number(e.target.value)
                            )
                          }
                          tabIndex={-1}
                          aria-label="Tick Spacing"
                          required
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-base-200 text-xs px-2 py-1 rounded shadow z-10">
                          Fixed at 1
                        </div>
                      </div>

                      <div className="form-control relative group">
                        <label className="label mb-2">
                          <span className="label-text font-semibold">
                            LP Fee (%)
                          </span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full cursor-not-allowed"
                          value={formData.lpFee}
                          readOnly
                          tabIndex={-1}
                          aria-label="LP Fee"
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-base-200 text-xs px-2 py-1 rounded shadow z-10">
                          Fixed at 0%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Access Control */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Users className="w-5 h-5 mr-2 text-accent" />
                      Access Control
                    </h3>

                    <div className="alert alert-info">
                      <Settings className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">Merkle Tree Access</h4>
                        <p className="text-sm">
                          A merkle tree will be created from your eligible
                          addresses list to enable efficient on-chain
                          verification.
                        </p>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label mb-2">
                        <span className="label-text font-semibold">
                          Eligible Addresses *
                        </span>
                        <span className="label-text-alt text-xs">
                          (One address per line)
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-40 font-mono text-sm w-full"
                        placeholder={`0x1234...\n0x5678...\n0x9abc...`}
                        value={addressListInput}
                        onChange={(e) =>
                          handleAddressListChange(e.target.value)
                        }
                        required
                      />
                      <label className="label">
                        <span className="label-text-alt mt-1">
                          {formData.eligibleAddresses.length} addresses added
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Features Preview */}
                <div className="divider">Pool Features</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-figure text-primary">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Access Control</div>
                    <div className="stat-desc">Merkle tree verification</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-figure text-accent">
                      <Coins className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Zero Fees</div>
                    <div className="stat-desc">0% LP fees</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-figure text-secondary">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="stat-title">DAO Controlled</div>
                    <div className="stat-desc">Member-only access</div>
                  </div>
                </div>

                <div className="card-actions justify-end pt-6">
                  {/* Error message */}
                  {status === "error" && (
                    <div className="alert alert-error h-full">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">Pool creation failed</h4>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className={`btn btn-primary btn-lg ${
                      isSubmitting ? "loading" : ""
                    }`}
                    disabled={
                      isSubmitting ||
                      !formData.daoName ||
                      !formData.daoTokenAddress ||
                      formData.eligibleAddresses.length === 0 ||
                      !daoTokenInfo.data ||
                      !liquidityTokenInfo.data
                    }>
                    {isSubmitting ? "Creating Pool..." : "Create LiquiDAO Pool"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
