# 🦛 Resupply MCP + CLI

**Re—hippo—thecate your yield like a pro.**

Agent-friendly tools for maximizing returns on [Resupply.fi](https://resupply.fi) — built for autonomous yield farming, powered by MCP.

```
    ____  _____ ______  ______  ____  __  __
   / __ \/ ___// ____/ / __/ / / / / / / / /
  / /_/ /\__ \/ __/   / /_/ / / / /_/ / /_/ /
 / _, _/___/ / /___  / __/ /_/ / __, / __  /
/_/ |_/____/_____/  /_/  \____/_/ /_/_/ /_/

     Agent Yield Farming Infrastructure
```

---

## 🎯 What is Resupply?

Resupply is a CDP-based stablecoin protocol that **maximizes yield on your stablecoin lending positions**:

1. 💰 **Lend** crvUSD/frxUSD on Curve Lend or Fraxlend (earn lending APY + CRV rewards)
2. 🏦 **Borrow** reUSD against those positions (borrow rate = 50% of lending rate, min 2%)
3. 🚀 **Deploy** reUSD into other yield opportunities (compounding returns)
4. 🛡️ **Minimal risk** — stablecoin vs stablecoin (no liquidation from volatility)

**Built by:** [Convex Finance](https://convexfinance.com) + [Yearn Finance](https://yearn.fi)  
**Audited by:** yAudit, ChainSecurity

---

## ⚡ Features

### 🤖 MCP Server (Model Context Protocol)

Expose Resupply operations to **any AI agent**:

- `resupply_get_markets` → List all available lending markets + APYs
- `resupply_get_position` → Check user position (collateral, debt, health factor)
- `resupply_calculate_borrow` → Calculate optimal borrow amount
- `resupply_simulate_strategy` → Project yields for a strategy
- `resupply_check_health` → Monitor liquidation risk

### 🖥️ CLI Tool

Command-line interface for **power users and automation**:

```bash
resupply markets          # List all markets + APYs
resupply deposit          # Deposit collateral
resupply borrow           # Borrow reUSD
resupply position         # Check your position
resupply simulate         # Simulate yield strategies
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone
git clone https://github.com/BAiSEDagent/resupply-mcp.git
cd resupply-mcp

# Install
npm install

# Configure
cp .env.example .env
# Add your Ethereum RPC URL
```

### MCP Server

```bash
# Start MCP server (stdio mode)
npm run mcp

# Server exposes 5 tools for AI agents
```

### CLI

```bash
# Build CLI
npm run build

# Check markets
./dist/cli/index.js markets

# Simulate a strategy
./dist/cli/index.js simulate --collateral 10000 --borrow 5000
```

---

## 🦛 Example Strategy

**The "Hippo Stack"** — Safe, compounding yield:

```
Step 1: Deposit 10,000 crvUSD to Curve Lend (sDOLA market)
        → Earn 8% APY

Step 2: Borrow 5,000 reUSD (50% LTV, safe collateralization)
        → Borrow cost: 4% APY (half of lending rate)

Step 3: Deploy reUSD to sfrxUSD (Savings frxUSD)
        → Earn 6% APY

Net Result:
  Lending:  +800 USDC/year (10,000 × 8%)
  Borrow:   -200 USDC/year (5,000 × 4%)
  reUSD:    +300 USDC/year (5,000 × 6%)
  ────────────────────────────────────
  Total:    +900 USCD/year = 9% APY on 10K

Risk: Stablecoin vs stablecoin → no liquidation from volatility
```

**Try it:**
```bash
resupply simulate --collateral 10000 --borrow 5000 --deployment sfrxUSD
```

---

## 📊 Available Markets

### Curve Lend (crvUSD)

| Market | Collateral | Typical APY | TVL |
|--------|-----------|-------------|-----|
| sDOLA | DOLA lending position | 8-12% | $50M+ |
| sUSDe | USDe lending position | 10-15% | $120M+ |
| sfrxUSD | frxUSD lending position | 6-10% | $80M+ |
| WETH | WETH lending position | 3-5% | $100M+ |
| wstETH | wstETH lending position | 3-5% | $90M+ |
| WBTC | WBTC lending position | 2-4% | $70M+ |

### Fraxlend (frxUSD)

| Market | Collateral | Typical APY | TVL |
|--------|-----------|-------------|-----|
| sfrxETH | frxETH lending position | 4-7% | $40M+ |
| sUSDe | USDe lending position | 10-15% | $60M+ |
| WBTC | WBTC lending position | 2-4% | $30M+ |

*APYs are dynamic and change based on utilization.*

---

## 🛡️ Safety

### Protocol Security
- ✅ **Audited** by yAudit and ChainSecurity
- ✅ **Non-custodial** — you control your keys
- ✅ **Insurance pool** — protocol has insurance against external risks
- ✅ **Battle-tested** — built by Convex + Yearn (combined $10B+ TVL)

### Risk Profile
- 🟢 **Minimal liquidation risk** — stablecoin vs stablecoin (no volatility)
- 🟡 **Smart contract risk** — all DeFi protocols have this risk (mitigated by audits)
- 🟡 **Lending market risk** — Curve/Frax failure (mitigated by insurance pool)

### Best Practices
1. **Start small** — test with $100-1000 first
2. **Maintain safe LTV** — 50-60% is safe, 80% is max
3. **Monitor health factor** — keep above 1.5x
4. **Diversify** — don't put all capital in one market

---

## 🔧 Development

### Setup

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript
npm test             # Run tests
npm run lint         # Lint code
npm run typecheck    # Type check
```

### Architecture

```
src/
├── mcp/              # MCP server
│   ├── server.ts     # MCP server entry
│   ├── tools.ts      # Tool definitions
│   └── handlers.ts   # Tool handlers
├── cli/              # CLI tool
│   ├── commands/     # CLI commands
│   └── index.ts      # CLI entry
├── lib/              # Shared logic
│   ├── resupply.ts   # Contract interactions
│   ├── viem.ts       # Viem client setup
│   └── utils.ts      # Helpers
└── types/            # TypeScript types
```

### Adding a New Market

1. Add contract address to `contracts/ADDRESSES.ts`
2. Update market list in `src/lib/resupply.ts`
3. Add CLI command if needed
4. Add tests
5. Update README

---

## 📚 Documentation

- **Resupply Docs:** https://docs.resupply.fi
- **Resupply App:** https://resupply.fi
- **GitHub:** https://github.com/resupplyfi/resupply
- **Curve Finance:** https://curve.fi
- **Frax Finance:** https://frax.finance

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Commit your changes (`git commit -m 'Add amazing thing'`)
4. Push to the branch (`git push origin feature/amazing-thing`)
5. Open a Pull Request

---

## 🎨 8-bit Hippo Art

```
          ___
         /   \
    ____| o o |____
   /    |  ~  |    \
  |  ___\___/___  |
  | /           \ |
  ||   RESUPPLY  ||
  ||   YIELD MAX ||
   \             /
    \___________/
      |  |  |  |
     /|  |  |  |\
    (_|  |  |  |_)

   "Hippopotential Unlocked"
```

---

## 📜 License

MIT License — see [LICENSE](LICENSE)

---

## 🙏 Credits

**Built by:** [@BAiSEDagent](https://github.com/BAiSEDagent) — Principal Engineer for Base ecosystem

**Powered by:**
- [Resupply Protocol](https://resupply.fi) (Convex + Yearn)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [viem](https://viem.sh) (Ethereum interactions)
- [Commander.js](https://github.com/tj/commander.js) (CLI)

---

## 💬 Community

- **Resupply Discord:** [Join here](https://discord.gg/resupply)
- **Resupply Twitter:** [@resupplyfi](https://twitter.com/resupplyfi)
- **Builder:** [@BAiSEDagent](https://twitter.com/BAiSEDagent) (Telegram: @atescch)

---

**Re—hippo—thecate responsibly. Not financial advice. DYOR.**

🦛 **Happy yield farming!** 🦛
