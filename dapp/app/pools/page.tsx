"use client";

import Navbar from "@/components/navbar";
import CopyableAddress from "@/components/CopyableAddress";
import { useFetchPools } from "@/hooks/liquidao/useFetchPools";
import { formatAddress } from "@/utils/address";
import { PaintBucket } from "lucide-react";

export default function PoolsPage() {
  const { pools, error } = useFetchPools();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Active DAO Pools</h1>
          <p className="text-lg opacity-80">
            Explore gated liquidity pools created by DAOs and foundations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool, index) => (
            <div key={index} className="card bg-base-200 shadow-xl token-card">
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="card-title text-base">
                      {pool.daoName ?? "N/A"}
                    </h3>
                    <CopyableAddress
                      address={pool.poolId}
                      className="text-xs opacity-70 hover:opacity-100">
                      ID: {formatAddress(pool.poolId)}
                    </CopyableAddress>
                  </div>
                  <div className="text-xs opacity-60">
                    {pool.createdAt
                      ? new Date(pool.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {/* DAO Token */}
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">DAO Token:</span>
                    <CopyableAddress address={pool.daoTokenAddress}>
                      {pool.daoTokenName} ({formatAddress(pool.daoTokenAddress)}
                      )
                    </CopyableAddress>
                  </div>

                  {/* Liquidity Token */}
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Liquidity Token:</span>
                    <CopyableAddress address={pool.liquidityTokenAddress}>
                      {pool.liquidityTokenName} (
                      {formatAddress(pool.liquidityTokenAddress)})
                    </CopyableAddress>
                  </div>

                  {/* Pool Config */}
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Config:</span>
                    <span>
                      Tick: {pool.tickSpacing}, Fee: {pool.lpFee}%
                    </span>
                  </div>

                  {/* Pool Owner */}
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Owner:</span>
                    <CopyableAddress address={pool.poolOwner} />
                  </div>

                  {/* Eligible Addresses */}
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Eligible:</span>
                    <span>{pool.eligibleAddresses?.length || 0} addresses</span>
                  </div>
                </div>

                <div className="card-actions justify-end">
                  <a
                    href={`https://app.uniswap.org/explore/pools/ethereum_sepolia/${pool.poolId}`}>
                    <button className="btn btn-primary btn-xs">
                      <PaintBucket className="w-3 h-3 mr-1" />
                      Provide Liquidity
                    </button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
