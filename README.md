# LiquiDAO

**Maximize your DAO's ecosystem liquidity and contributor retention with permissioned pools exclusively reserved to your core contributors.**

---

## 🎯 Why LiquiDAO Exists

**The Problem: DAO Contributors Face Liquidity Hell**

DAOs increasingly compensate contributors with governance tokens to align long-term incentives. However, these contributors face a critical liquidity problem:

- **Poor conversion rates** when swapping earned tokens to stablecoins
- **MEV extraction** by arbitrage bots capturing value meant for the community
- **High slippage and fees** on public DEXs for smaller trades
- **Lack of reliable liquidity** making token-based compensation less attractive

**The Cost: Talent Drain & Value Leakage**

This forces DAOs to either:

1. Pay contributors in stablecoins (losing alignment benefits)
2. Watch their best talent leave due to liquidity frustrations
3. Accept massive value leakage to external MEV extractors

**The Solution: DAO-Native Liquidity Infrastructure**

LiquiDAO creates **permissioned liquidity pools** that function like employee liquidity programs in Web2 (Stripe's tender offers, CartaX), but built natively for DAOs using Uniswap v4 hooks.

---

## 🔧 How It Works

### Core Architecture

LiquiDAO leverages **Uniswap v4 hooks** to create gated liquidity pools with the following properties:

- **Zero fees** for approved contributors
- **Permissioned access** via allowlists or ZK-based verification
- **MEV capture** redirected back to the DAO treasury

### Technical Implementation

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   DAO Treasury  │────│  LiquiDAO Hook   │────│  Contributors   │
│                 │    │                  │    │                 │
│ • Provides LP   │    │ • Access Control │    │ • Zero-fee      │
│ • Captures MEV  │    │ • Fee Override   │    │ • Instant       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Key Components:**

1. **LiquiDAOHook.sol**: Core hook implementing access control and fee logic
2. **Permission System**: Configurable allowlist or ZK-proof verification
3. **MEV Redistribution**: Captured arbitrage flows back to DAO

---

## 📁 Repository Structure

```
liquidao/
├── contracts/                # Smart contracts & deployment
│   ├── ...
│
├── dapp/                     # Next.js frontend application
│   ├── ...
│
└── README.md                 # This file
```

### Key Dependencies

- **Uniswap v4 Core & Periphery**: Pool management and hook infrastructure
- **OpenZeppelin**: Security-audited contract utilities
- **Foundry**: Smart contract development framework

---

## 🚀 Vision & Roadmap

### Short-term (Q3 2025)

- ✅ POC hook implementation
- 🔄 MVP hook implementation
- 🔄 Create the LiquiDAO brand
- 🔄 Security audit and optimization
- 🔄 Frontend interface for pool creation
- 🔄 Allowlist-based permission system

### Medium-term (Q4 2025)

- 🔮 ZK-based privacy-preserving permissions
- 🔮 JIT (Just-In-Time) liquidity between a public pool and the private pool
- 🔮 Advanced MEV redistribution mechanisms

---

## 🏗️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Foundry](https://getfoundry.sh/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pybast/liquidao.git
   cd liquidao
   ```

2. **Install contract dependencies**

   ```bash
   cd contracts
   forge install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../dapp
   npm install
   ```

### Development

1. **Setup environment variables**

   ```bash
   # In contracts directory
   cd contracts
   cp .env.example .env
   # Edit .env with your configuration

   # In dapp directory
   cd ../dapp
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Run contract tests**

   ```bash
   cd contracts
   forge test
   ```

3. **Start local development**

   ```bash
   cd dapp
   npm run dev
   ```

4. **Deploy to testnet**
   ```bash
   cd contracts
   make deploy
   ```

---

## 🤝 Contributing

We welcome contributions from the community!

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- 🔒 **Security**: Hook security audits and improvements
- 🎨 **Frontend**: UX/UI enhancements and new features
- 🧪 **Testing**: Comprehensive test coverage expansion

---

## 🛡️ Security

LiquiDAO handles sensitive DAO treasury operations. We prioritize security through:

- **Formal verification** of critical contract logic
- **Multi-signature** requirements for admin functions
- **Gradual rollout** with extensive testnet validation
- **Community audits** and bug bounty programs

**Responsible Disclosure**: Please report security vulnerabilities to https://t.me/pybast

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Uniswap Foundation** for the v4 hook infrastructure
- **ETH Global Prague and my teamates** hackathon for the initial development sprint
- **Hook Incubator Program** for technical guidance and support
- **DAO contributors everywhere** who inspired this solution

---

## 📞 Contact & Community

- **Website**: Coming soon
- **Documentation**: Coming soon
- **Discord**: Coming soon
- **Twitter**: Coming soon

**Built with ❤️ for the DAO ecosystem**
