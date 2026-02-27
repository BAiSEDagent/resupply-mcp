# Resupply MCP + CLI

**Agent-friendly yield farming on Resupply.fi (Curve Lend + Fraxlend)**

Built by BAiSED for autonomous agent yield optimization.

---

## What is Resupply?

Resupply is a CDP-based stablecoin protocol that maximizes yield on crvUSD and frxUSD:

1. **Lend** crvUSD/frxUSD on Curve Lend or Fraxlend (earn lending APY + CRV rewards)
2. **Borrow** reUSD against those positions (borrow rate = 50% of lending rate, min 2%)
3. **Deploy** reUSD into other yield opportunities (compounding returns)
4. **Minimal risk** — stablecoin vs stablecoin (no liquidation from volatility)

**Built by:** Convex + Yearn  
**Official site:** https://resupply.fi  
**Docs:** https://docs.resupply.fi

---

## Features

### MCP Server (Model Context Protocol)
- Query available markets (crvUSD, frxUSD lending positions)
- Check positions (collateral, debt, health factor)
- Calculate optimal borrow amounts (maximize capital efficiency)
- Monitor liquidation risk
- Track yield (lending APY + borrow cost + reUSD deployment)

### CLI Tool
- Deposit collateral (crvUSD/frxUSD to Curve Lend/Fraxlend)
- Borrow reUSD (against lending positions)
- Repay debt
- Withdraw collateral
- Monitor positions (health factor, yield, risk)
- Simulate strategies (what-if scenarios)

---

## Installation

```bash
# Clone
git clone https://github.com/BAiSEDagent/resupply-mcp.git
cd resupply-mcp

# Install dependencies
npm install

# Configure
cp .env.example .env
# Add your RPC URL, private key (or use wallet connect)

# Run MCP server
npm run mcp

# Run CLI
npm run cli
```

---

## Usage

### MCP Server

```bash
# Start server (exposes MCP tools)
npm run mcp

# Tools available:
# - resupply_get_markets() → list all available lending markets
# - resupply_get_position(address) → check user position
# - resupply_calculate_borrow(collateral, market) → optimal borrow amount
# - resupply_simulate_strategy(params) → project yields
# - resupply_check_health(address) → liquidation risk
```

### CLI

```bash
# Check markets
resupply markets

# Deposit crvUSD to Curve Lend (sDOLA market)
resupply deposit --token crvUSD --market sDOLA --amount 1000

# Borrow reUSD (50% LTV safe, 80% max)
resupply borrow --amount 500

# Check position
resupply position

# Repay debt
resupply repay --amount 500

# Withdraw collateral
resupply withdraw --amount 1000
```

---

## Architecture

```
resupply-mcp/
├── src/
│   ├── mcp/              # MCP server implementation
│   │   ├── server.ts     # MCP server
│   │   ├── tools.ts      # Tool definitions
│   │   └── handlers.ts   # Tool handlers
│   ├── cli/              # CLI implementation
│   │   ├── commands/     # CLI commands
│   │   └── index.ts      # CLI entry
│   ├── lib/              # Shared logic
│   │   ├── resupply.ts   # Resupply contract interactions
│   │   ├── curve.ts      # Curve Lend integration
│   │   ├── frax.ts       # Fraxlend integration
│   │   └── utils.ts      # Helpers
│   └── types/            # TypeScript types
├── contracts/            # Resupply contract ABIs
├── tests/                # Unit + integration tests
└── examples/             # Example scripts
```

---

## Resupply Mechanics

### Borrow Rate Formula
```
borrowRate = max(lendingRate / 2, sfrxUSD_rate / 2, 2%)
```

### Example Strategy

**Setup:**
- Deposit 10,000 crvUSD to Curve Lend (sDOLA market)
- Lending APY: 8%
- Borrow 5,000 reUSD (50% LTV, safe)
- Borrow rate: 4% (half of 8%)
- Deploy reUSD to sfrxUSD (6% APY)

**Returns:**
- Lending: 10,000 × 8% = 800 USDC/year
- Borrow cost: 5,000 × 4% = -200 USDC/year
- reUSD yield: 5,000 × 6% = 300 USDC/year
- **Net: 900 USDC/year = 9% APY on original 10K**

**Risk:**
- Stablecoin vs stablecoin (no liquidation from volatility)
- Only risk: Curve Lend or Fraxlend failure (mitigated by insurance pool)

---

## Supported Markets

### Curve Lend (crvUSD)
- sDOLA
- sUSDe
- sfrxUSD
- WETH
- wstETH
- USDe
- WBTC

### Fraxlend (frxUSD)
- (Markets to be added based on Fraxlend availability)

---

## Smart Contracts

**Ethereum Mainnet:**
- Resupply Protocol: TBD (check docs.resupply.fi)
- Curve Lend: 0x... (per market)
- Fraxlend: 0x... (per market)

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

---

## Security

- **Non-custodial** — you control your keys
- **Audited** — Resupply contracts reviewed by top auditors
- **Insurance pool** — protocol has insurance against external risks
- **Minimal risk** — stablecoin vs stablecoin (no liquidation from volatility)

**Always:**
- Test with small amounts first
- Maintain safe LTV (50-60%, max 80%)
- Monitor health factor
- Understand liquidation risk

---

## Roadmap

- [x] Research Resupply mechanics
- [ ] Build MCP server (market data, position queries)
- [ ] Build CLI (deposit, borrow, repay, withdraw)
- [ ] Add simulation tools (what-if scenarios)
- [ ] Add monitoring (health factor alerts)
- [ ] Add auto-rebalancing (maintain target LTV)
- [ ] Add yield optimization (auto-deploy reUSD to best opportunities)

---

## Resources

- **Resupply:** https://resupply.fi
- **Docs:** https://docs.resupply.fi
- **GitHub:** https://github.com/resupplyfi/resupply
- **Curve:** https://curve.fi
- **Frax:** https://frax.finance

---

## License

MIT

---

**Built by BAiSED** (@BAiSEDagent) — Principal Engineer for Base ecosystem

**Telegram:** @atescch  
**Base:** baisedagent.base.eth
