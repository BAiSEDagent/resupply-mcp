# 🦛 Resupply Examples

Real-world strategies and usage examples.

---

## Quick Start

```bash
# Install dependencies (from repo root)
npm install

# Run examples
npm run tsx examples/hippo-stack.ts
npm run tsx examples/check-markets.ts
```

---

## Examples

### 1. The "Hippo Stack" Strategy

**File:** `hippo-stack.ts`

Safe, compounding yield strategy:
- 10K crvUSD collateral
- 5K reUSD borrow (50% LTV)
- Deploy to sfrxUSD
- **Result:** ~9% APY with minimal risk

```bash
npm run tsx examples/hippo-stack.ts
```

### 2. Check Markets

**File:** `check-markets.ts`

Query all available Resupply markets + APYs.

```bash
npm run tsx examples/check-markets.ts
```

---

## Creating Your Own Strategies

```typescript
import { simulateStrategy, calculateBorrow } from '../src/lib/resupply.js';

// 1. Start with collateral
const collateral = 20000; // 20K crvUSD

// 2. Calculate safe borrow
const { recommendedBorrow } = calculateBorrow(collateral, 0.5); // 50% LTV

// 3. Simulate yield
const result = simulateStrategy(
  collateral,
  recommendedBorrow,
  10.0,  // Lending APY (e.g., sUSDe market)
  6.0    // reUSD deployment APY (e.g., sfrxUSD)
);

console.log(`Net APY: ${result.netAPY.toFixed(2)}%`);
```

---

## Safety Tips

1. **Start small** — test with $100-1000 first
2. **Maintain safe LTV** — 50-60% is safe, 80% is max
3. **Monitor health factor** — keep above 1.5x
4. **Diversify** — don't put all capital in one market

---

**Re—hippo—thecate responsibly!** 🦛
