# Resupply MCP + CLI Audit

**Audit Date:** 2026-02-27  
**Auditor:** BAiSED  
**Scope:** Full security + quality review before bounty submission

---

## 🚨 CRITICAL Issues

### C-1: MCP Server Not Using Real Contract Integration

**File:** `src/mcp/server.ts`  
**Severity:** CRITICAL  
**Status:** NEEDS FIX

**Issue:**
All MCP tool handlers return placeholder/hardcoded data instead of calling the real contract integration functions from `src/lib/resupply.ts`.

**Evidence:**
```typescript
async function getMarkets() {
  // TODO: Query Resupply contracts for available markets
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          markets: [
            { name: 'sDOLA', lendingAPY: 8.5, ... }, // HARDCODED
```

**Impact:**
- MCP server returns fake data to AI agents
- Zero real functionality
- False advertising (README claims "real contract integration")

**Fix:**
Replace all placeholder functions with actual calls to `src/lib/resupply.ts`:

```typescript
import { getMarkets as getMarketsLib, getPosition as getPositionLib, ... } from '../lib/resupply.js';

async function getMarkets() {
  const markets = await getMarketsLib();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(markets, null, 2),
    }],
  };
}
```

---

### C-2: CLI Commands Don't Execute Real Transactions

**File:** `src/cli/index.ts`  
**Severity:** CRITICAL  
**Status:** NEEDS FIX

**Issue:**
All CLI commands (`markets`, `deposit`, `borrow`, `position`) return hardcoded data instead of executing real queries/transactions.

**Evidence:**
```typescript
.action(async () => {
  const spinner = ora('Fetching markets...').start();
  
  // TODO: Fetch real market data
  const markets = [
    { name: 'sDOLA', lendingAPY: 8.5, ... }, // HARDCODED
```

**Impact:**
- CLI is a demo/mockup, not functional
- Users cannot actually interact with Resupply
- False claims in README

**Fix:**
Wire up all CLI commands to `src/lib/resupply.ts`:

```typescript
.action(async () => {
  const spinner = ora('Fetching markets...').start();
  const markets = await getMarkets(); // REAL CALL
  spinner.succeed('Markets loaded');
  // ... display real data
});
```

---

### C-3: TypeScript Compilation Errors

**Severity:** CRITICAL  
**Status:** NEEDS FIX

**Issue:**
Project does not compile. 14 TypeScript errors:

1. **rootDir violation:** `contracts/ADDRESSES.ts` not under `src/` (tsconfig issue)
2. **Undefined args:** MCP server doesn't check if `args` exists before access (13 errors)

**Evidence:**
```
src/mcp/server.ts(143,34): error TS18048: 'args' is possibly 'undefined'.
src/mcp/server.ts(143,34): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
```

**Impact:**
- Cannot build production package
- Runtime crashes likely
- TypeScript safety guarantees void

**Fix:**

**1. Move contracts/ to src/:**
```bash
mv contracts/ src/contracts/
```

Update imports:
```typescript
import { ADDRESSES } from '../contracts/ADDRESSES.js'; // Remove leading ../..
```

**2. Add args validation in MCP server:**
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Add validation
  if (!args) {
    throw new Error('Missing arguments');
  }

  try {
    switch (name) {
      case 'resupply_get_position':
        if (typeof args.address !== 'string') {
          throw new Error('Invalid address');
        }
        return await getPosition(args.address);
      // ... etc
```

---

## ⚠️ HIGH Issues

### H-1: getUserSnapshot ABI Has Wrong stateMutability

**File:** `contracts/abis/ResupplyPair.json`  
**Severity:** HIGH  
**Status:** NEEDS FIX

**Issue:**
`getUserSnapshot` is marked as `nonpayable` but is actually a view function (read-only). This will cause viem to send transactions instead of calls.

**Evidence:**
```json
{
  "inputs": [{"name": "_address", "type": "address"}],
  "name": "getUserSnapshot",
  "outputs": [...],
  "stateMutability": "nonpayable", // WRONG
  "type": "function"
}
```

From Solidity source:
```solidity
function getUserSnapshot(address _address) 
  external 
  view  // VIEW FUNCTION
  returns (uint256 _borrowShares, uint256 _collateralBalance)
```

**Impact:**
- viem will try to send transactions for read operations
- Unnecessary gas costs
- Calls will fail without wallet/signer

**Fix:**
```json
"stateMutability": "view", // CORRECT
```

---

### H-2: Missing Error Handling in getMarkets()

**File:** `src/lib/resupply.ts`  
**Severity:** HIGH  
**Status:** NEEDS IMPROVEMENT

**Issue:**
`getMarkets()` catches errors on individual pairs but continues silently. If ALL pairs fail, it returns empty array with no indication of failure.

**Evidence:**
```typescript
for (const pairAddress of Object.values(ADDRESSES.PAIRS)) {
  try {
    // ... query pair
  } catch (error) {
    console.warn(`Failed to fetch data for pair ${pairAddress}:`, error);
    // Continues silently
  }
}

return markets; // Could be empty array
```

**Impact:**
- AI agents get empty market list and think protocol is offline
- No way to distinguish "no markets" from "all queries failed"
- Silent failures hide RPC issues

**Fix:**
Track failures and throw if all pairs fail:

```typescript
const markets: Market[] = [];
const failures: string[] = [];

for (const pairAddress of Object.values(ADDRESSES.PAIRS)) {
  try {
    // ... query pair
    markets.push(...);
  } catch (error) {
    failures.push(pairAddress);
    console.warn(`Failed to fetch data for pair ${pairAddress}:`, error);
  }
}

if (markets.length === 0 && failures.length > 0) {
  throw new Error(`Failed to fetch any markets. ${failures.length} pairs failed.`);
}

return markets;
```

---

### H-3: APY Calculation May Be Incorrect

**File:** `src/lib/resupply.ts`  
**Severity:** HIGH  
**Status:** NEEDS VALIDATION

**Issue:**
APY calculation assumes `ratePerSec` has 18 decimals. Need to verify this matches actual contract implementation.

**Evidence:**
```typescript
function calculateAPYFromRate(ratePerSec: number): number {
  const secondsPerYear = 365.25 * 24 * 60 * 60;
  const ratePerYear = ratePerSec * secondsPerYear;
  const apy = (ratePerYear / 1e18) * 100; // Assumes 18 decimals
  return apy;
}
```

**Impact:**
- If decimals are wrong, APYs will be wildly incorrect
- AI agents will make bad decisions based on bad data
- Users will deposit expecting one APY and get another

**Recommendation:**
1. Verify `ratePerSec` encoding from Curve/Frax contract source
2. Add unit tests with known rate values
3. Compare against Resupply frontend APYs

---

### H-4: Position Debt Calculation Is Oversimplified

**File:** `src/lib/resupply.ts`  
**Severity:** HIGH  
**Status:** NEEDS FIX

**Issue:**
`getPosition()` assumes 1:1 mapping between borrow shares and debt amount. This is incorrect — shares must be converted to amount using `totalBorrowAmount / totalBorrowShares`.

**Evidence:**
```typescript
const [borrowShares, collateralBalance] = snapshot as [bigint, bigint];

// For now, assume 1:1 for shares (need total shares to calculate exact debt)
const debt = borrowShares; // Simplified — WRONG
```

**Impact:**
- Health factor calculations will be incorrect
- Liquidation risk assessments will be wrong
- Users could get liquidated due to incorrect health estimates

**Fix:**
Query `totalBorrowAmount` and `totalBorrowShares` from pair accounting, then calculate:

```typescript
const [snapshot, accounting] = await Promise.all([
  publicClient.readContract({
    address: pairAddress as `0x${string}`,
    abi: PairABI,
    functionName: 'getUserSnapshot',
    args: [userAddress],
  }),
  publicClient.readContract({
    address: pairAddress as `0x${string}`,
    abi: PairABI,
    functionName: 'getPairAccounting',
  }),
]);

const [borrowShares, collateralBalance] = snapshot as [bigint, bigint];
const [, totalBorrowAmount, totalBorrowShares] = accounting as [bigint, bigint, bigint];

// Correct calculation
const debt = totalBorrowShares > 0n
  ? (borrowShares * totalBorrowAmount) / totalBorrowShares
  : 0n;
```

---

## ⚠️ MEDIUM Issues

### M-1: No RPC Rate Limiting

**File:** `src/lib/resupply.ts`  
**Severity:** MEDIUM  
**Status:** NEEDS IMPROVEMENT

**Issue:**
`getMarkets()` queries 11 pairs sequentially with no rate limiting. Public RPCs will throttle/ban.

**Evidence:**
```typescript
for (const pairAddress of Object.values(ADDRESSES.PAIRS)) {
  const [name, asset, collateral, rateInfo, accounting] = await Promise.all([
    // 5 contract calls PER pair
    // 11 pairs = 55 calls in rapid succession
```

**Impact:**
- Public RPC endpoints will rate limit or ban
- Alchemy free tier: 5 calls/sec
- Tool will be unreliable for users without premium RPC

**Recommendations:**
1. Add batch delay between pair queries
2. Implement retry logic with exponential backoff
3. Document RPC requirements in README
4. Consider using multicall to batch queries

---

### M-2: Missing Input Validation

**File:** `src/lib/resupply.ts`  
**Severity:** MEDIUM  
**Status:** NEEDS IMPROVEMENT

**Issue:**
Functions don't validate inputs. Invalid addresses or amounts will cause cryptic viem errors.

**Examples:**
- `getPosition()` doesn't check if address is valid Ethereum address
- `simulateStrategy()` doesn't validate amount ranges
- No checks for negative numbers

**Fix:**
Add input validation:

```typescript
import { isAddress } from 'viem';

export async function getPosition(
  userAddress: string,
  pairAddress: string,
  client?: PublicClient
): Promise<Position> {
  if (!isAddress(userAddress)) {
    throw new Error('Invalid user address');
  }
  if (!isAddress(pairAddress)) {
    throw new Error('Invalid pair address');
  }
  // ... rest of function
}
```

---

### M-3: Lending APY Calculation Is a Guess

**File:** `src/lib/resupply.ts` (line 77)  
**Severity:** MEDIUM  
**Status:** NEEDS FIX

**Issue:**
Code assumes lending APY = borrow APY * 2 with no justification. This is speculation.

**Evidence:**
```typescript
const borrowAPY = calculateAPYFromRate(Number(ratePerSec));
const lendingAPY = borrowAPY * 2; // Rough estimate (borrow = 50% of lending)
```

**Impact:**
- Reported APYs may be completely wrong
- AI agents will optimize strategies based on bad data
- Users will be misled

**Recommendation:**
Either:
1. Query actual lending rate from Curve/Frax contracts
2. Calculate from utilization rate (if available)
3. Label as "estimated" in output and document assumption

---

### M-4: No Transaction Write Functions

**File:** `src/lib/resupply.ts`  
**Severity:** MEDIUM  
**Status:** INCOMPLETE

**Issue:**
Library only has read functions. No way to actually deposit, borrow, or repay via MCP/CLI.

**Impact:**
- Tool is read-only (less valuable)
- Can simulate but not execute strategies
- Missing core functionality

**Recommendation:**
Add write functions:

```typescript
export async function deposit(
  pairAddress: string,
  amount: bigint,
  client: WalletClient
): Promise<string> {
  // Execute addCollateral transaction
  const hash = await client.writeContract({
    address: pairAddress as `0x${string}`,
    abi: PairABI,
    functionName: 'addCollateral',
    args: [amount],
  });
  return hash;
}

export async function borrow(...) { ... }
export async function repay(...) { ... }
```

---

## 📝 LOW / Informational Issues

### I-1: No Tests

**Severity:** LOW  
**Status:** NEEDS TESTS

No unit tests for contract integration. Should test:
- APY calculations with known inputs
- Share-to-amount conversions
- Error handling
- Edge cases (zero amounts, max values)

---

### I-2: Missing JSDoc on Public Functions

**Severity:** LOW  
**Status:** NEEDS DOCS

Only some functions have JSDoc comments. All public exports should be documented.

---

### I-3: No CI/CD Pipeline

**Severity:** LOW  
**Status:** NEEDS AUTOMATION

No GitHub Actions for:
- Type checking
- Tests
- Linting
- Build validation

---

## ✅ Strengths

1. **Clean Architecture:** Clear separation between lib, MCP, and CLI layers
2. **Good README:** Well-documented, 8-bit hippo theme is 🔥
3. **Real ABIs:** Extracted from actual contract source
4. **Proper Addresses:** Verified from deployment artifacts
5. **viem Integration:** Modern, type-safe Web3 library
6. **Error Handling Structure:** Try-catch blocks in place (just need better logic)

---

## 🎯 Priority Fix Order

**Before Bounty Submission:**

1. **CRITICAL:** Fix TypeScript compilation (C-3)
2. **CRITICAL:** Wire MCP server to real contracts (C-1)
3. **CRITICAL:** Wire CLI to real contracts (C-2)
4. **HIGH:** Fix getUserSnapshot ABI (H-1)
5. **HIGH:** Fix debt calculation (H-4)
6. **HIGH:** Validate APY calculations against real data (H-3)
7. **MEDIUM:** Add input validation (M-2)
8. **MEDIUM:** Document RPC requirements (M-1)
9. **MEDIUM:** Fix lending APY estimation (M-3)

**Post-MVP:**
- Add write functions (M-4)
- Add tests (I-1)
- Add CI/CD (I-3)
- Rate limiting (M-1)

---

## 🏁 Verdict

**Status:** NOT PRODUCTION READY

**Estimated Fix Time:** 4-6 hours

**Risk Assessment:**
- **Security:** LOW (no fund handling yet, read-only)
- **Functionality:** MEDIUM (core features incomplete)
- **Reliability:** HIGH (compilation fails, wrong calculations)
- **Reputation:** MEDIUM (overpromises, underdelivers)

**Recommendation:**
Fix C-1 through H-4 before any public submission or bounty claim. Current state would damage credibility.

---

## 📋 Checklist

- [ ] C-1: Wire MCP server to real contracts
- [ ] C-2: Wire CLI to real contracts
- [ ] C-3: Fix TypeScript compilation
- [ ] H-1: Fix getUserSnapshot ABI
- [ ] H-2: Improve error handling
- [ ] H-3: Validate APY calculations
- [ ] H-4: Fix debt calculation
- [ ] M-1: Document RPC requirements
- [ ] M-2: Add input validation
- [ ] M-3: Fix lending APY estimation
- [ ] Test on mainnet
- [ ] Compare APYs with Resupply frontend
- [ ] Write unit tests
- [ ] Update README with limitations

---

**End of Audit**
