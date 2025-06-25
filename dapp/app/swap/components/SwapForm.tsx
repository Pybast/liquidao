import { Coins, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface Token {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  icon: string;
}

// Hardcoded for now, will be coming from a contract read
const tokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x...",
    balance: "2.5",
    icon: "⟠",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x...",
    balance: "1,250.00",
    icon: "💵",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0x...",
    balance: "45.2",
    icon: "🦄",
  },
  {
    symbol: "COMP",
    name: "Compound",
    address: "0x...",
    balance: "12.8",
    icon: "🏛️",
  },
];

export function SwapForm({
  emailContent,
  expectedDomain,
  onComplete,
}: {
  emailContent: string;
  expectedDomain: string;
  onComplete(result: boolean): void;
}) {
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [amount, setAmount] = useState("");

  const error = undefined as undefined | Error; // TODO reactivate

  function handleSubmitSwap() {
    // TODO implement
  }

  const renderTokenSelector = (
    selectedToken: Token,
    onSelect: (token: Token) => void,
    label: string
  ) => (
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
            <span className="text-2xl mr-2">{selectedToken.icon}</span>
            <div className="text-left">
              <div className="font-semibold">{selectedToken.symbol}</div>
              <div className="text-xs opacity-70">{selectedToken.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">Balance</div>
            <div className="font-mono">{selectedToken.balance}</div>
          </div>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full mt-1">
          {tokens.map((token) => (
            <li key={token.symbol}>
              <a
                onClick={() => onSelect(token)}
                className="flex justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{token.icon}</span>
                  <div>
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs opacity-70">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{token.balance}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

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
              {renderTokenSelector(fromToken, setFromToken, "From")}

              {/* Amount Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                  <span className="label-text-alt">
                    Balance: {fromToken.balance} {fromToken.symbol}
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
                    onClick={() => setAmount(fromToken.balance)}>
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

              {/* Submit Button */}
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleSubmitSwap}
                disabled={
                  !amount || !fromToken || Number.parseFloat(amount) <= 0
                }>
                <Mail className="w-5 h-5 mr-2" />
                Initiate Verified Swap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
