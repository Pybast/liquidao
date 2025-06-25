import Link from "next/link"
import Navbar from "@/components/navbar"
import { Shield, Zap, Lock, TrendingUp, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="hero min-h-screen gradient-bg">
        <div className="hero-content text-center text-white">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6">
              Gated Cross-Chain DEX
              <span className="text-accent block mt-2">for DAOs & Foundations</span>
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Private, low-fee swapping environment verified via email proofs. Built on Uniswap v4 with MEV protection
              and seamless cross-chain routing.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/dao/create" className="btn btn-primary btn-lg glow-effect">
                <Shield className="w-5 h-5 mr-2" />
                Create DAO Pool
              </Link>
              <Link href="/swap" className="btn btn-accent btn-lg">
                <Zap className="w-5 h-5 mr-2" />
                Start Swapping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose GatedPools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl token-card">
              <div className="card-body text-center">
                <Lock className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="card-title justify-center">Gated Access</h3>
                <p>Email-verified access ensures only authorized employees can trade</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl token-card">
              <div className="card-body text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-accent mb-4" />
                <h3 className="card-title justify-center">MEV Protection</h3>
                <p>Eliminate slippage loss to MEV bots with restricted pool access</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl token-card">
              <div className="card-body text-center">
                <Globe className="w-12 h-12 mx-auto text-secondary mb-4" />
                <h3 className="card-title justify-center">Cross-Chain</h3>
                <p>Seamless swapping across multiple chains with unified liquidity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
