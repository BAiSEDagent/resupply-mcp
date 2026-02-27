# Coding Governor Post-Mortem Audit — Resupply MCP

**Date:** 2026-02-27 13:15 PST  
**Context:** Emergency audit AFTER code shipped to dev  
**Mode:** Post-mortem (code already exists)

---

## Phase 1: PLAN (Retroactive)

### What Was Planned (Implicit)
- Build MCP server for Resupply.fi
- Build CLI for Resupply.fi
- Query Ethereum mainnet for market data
- Calculate yields, health factors
- Revenue opportunity: $500-10K bounty

### What Should Have Been Planned
- [ ] **Requirements:** What MCP tools? What CLI commands?
- [ ] **Dependencies:** RPC endpoint (Alchemy/Infura), viem version, MCP SDK version
- [ ] **Success Criteria:** Queries work on mainnet, calculations match Resupply frontend
- [ ] **Assumptions:** "Quick scaffold → real integration later" (WRONG — caused C-1, C-2)
- [ ] **Estimate:** 4-6 hours realistic (not "quick")

### Verification
- [ ] ❌ No written plan existed
- [ ] ❌ Success criteria not defined
- [ ] ❌ Assumptions not documented
- [ ] ❌ Estimate was wrong (claimed "quick", took 12+ hours with fixes)

### FAIL: Phase 1 was skipped entirely

---

## Phase 2: IMPLEMENT

### What Was Implemented
- ✅ MCP server scaffold (`src/mcp/server.ts`)
- ✅ CLI scaffold (`src/cli/index.ts`)
- ✅ Contract integration library (`src/lib/resupply.ts`)
- ✅ ABIs extracted (`src/contracts/abis/`)
- ✅ Contract addresses documented (`src/contracts/ADDRESSES.ts`)

### Code Quality Check
- ❌ **TypeScript:** 14 compilation errors (contracts/ not under src/)
- ❌ **Placeholders:** MCP server + CLI returned hardcoded data
- ❌ **Imports:** Wrong paths (../../contracts/ instead of ../contracts/)
- ⚠️ **Logic Errors:** Debt calculation used 1:1 assumption (incorrect)
- ⚠️ **ABI Errors:** getUserSnapshot marked nonpayable (should be view)

### Verification
- [ ] ❌ Code did NOT compile
- [ ] ❌ Linting not run
- [ ] ❌ Type errors not fixed
- [ ] ❌ Placeholders not replaced

### FAIL: Phase 2 incomplete (scaffolds, not real integration)

---

## Phase 3: TEST

### Tests That Should Exist
1. **Unit Tests:**
   - `calculateAPYFromRate()` with known inputs
   - `calculateBorrow()` with edge cases (zero collateral, max LTV)
   - `simulateStrategy()` with various APYs
   - `checkHealth()` with safe/warning/danger scenarios

2. **Integration Tests:**
   - `getMarkets()` against mainnet fork
   - `getPosition()` against mainnet fork (with real addresses)
   - Share-to-debt conversion accuracy

3. **E2E Tests:**
   - MCP server tools respond correctly
   - CLI commands query mainnet successfully
   - Error handling when RPC fails

### Tests That Exist
- ❌ **ZERO TESTS**
- ❌ No test files
- ❌ No test configuration
- ❌ No coverage reports

### Verification
- [ ] ❌ No tests pass (because none exist)
- [ ] ❌ No test coverage
- [ ] ❌ Edge cases not tested

### CRITICAL FAIL: Phase 3 completely skipped

---

## Phase 4: SECURITY

### Security Checklist
- [ ] ❌ **User Input Validation:** Missing isAddress() checks
- [ ] ⚠️ **External Calls:** RPC calls have no retry logic or rate limiting
- [ ] ✅ **Secrets:** No hardcoded secrets (uses .env)
- [ ] ⚠️ **Error Handling:** getMarkets() could return empty array silently (fixed in emergency)
- [ ] ✅ **No Fund Handling:** Read-only tool (low risk)

### Static Analysis
- ❌ **Not Run:** No ESLint, no TypeScript strict mode check

### Audit Findings (Manual)
- **C-1:** MCP server not calling real contracts (CRITICAL)
- **C-2:** CLI not calling real contracts (CRITICAL)
- **C-3:** 14 TypeScript errors (CRITICAL)
- **H-1:** Wrong ABI stateMutability (HIGH)
- **H-2:** Silent failures in getMarkets() (HIGH)
- **H-3:** APY calculation needs validation (HIGH)
- **H-4:** Incorrect debt calculation (HIGH)
- **M-1:** No RPC rate limiting (MEDIUM)
- **M-2:** Missing input validation (MEDIUM)
- **M-3:** Lending APY is speculation (MEDIUM)
- **M-4:** No write functions (MEDIUM)

### Verification
- [ ] ❌ 3 CRITICAL findings
- [ ] ❌ 5 HIGH findings
- [ ] ❌ 4 MEDIUM findings

### CRITICAL FAIL: Phase 4 done AFTER code sent to dev

---

## Phase 5: SHIP

### Deployment Process
- ❌ **No Pre-Deploy Checklist:** Tests not run (none exist)
- ❌ **No Staging:** Sent directly to dev without testing
- ❌ **No Health Check:** No verification it works on mainnet
- ❌ **No Smoke Test:** No manual verification of any tool/command

### What Actually Happened
1. Code scaffolded with placeholders
2. Sent to dev BEFORE audit
3. Audit found 12 critical/high issues
4. Emergency 15-minute fix
5. Re-shipped to dev

### Verification
- [ ] ❌ Deployment not safe (critical bugs present)
- [ ] ❌ No health check
- [ ] ❌ No smoke test
- [ ] ✅ Fixed in emergency mode (but should never have shipped broken)

### CRITICAL FAIL: Shipped untested, broken code

---

## Phase 6: REPORT

### What Should Be Documented
- [ ] What was built (MCP + CLI for Resupply.fi)
- [ ] Files changed (with line counts)
- [ ] Test results (NONE — should have blocked ship)
- [ ] Security findings (12 issues — should have blocked ship)
- [ ] Deployment evidence (URL N/A — not deployed, sent to dev)
- [ ] Learnings (CRITICAL: never skip governor phases)

### What Was Documented
- ✅ AUDIT.md (after the fact)
- ✅ FIXES.md (emergency repair)
- ❌ No Ship Report (because it wasn't ship-ready)

### Verification
- [ ] ⚠️ Report exists (retroactive, not pre-ship)
- [ ] ❌ No evidence it worked before sending to dev

### PARTIAL FAIL: Documented AFTER emergency, not before ship

---

## Rollback Evaluation

### What Happened
1. Code sent to dev prematurely
2. Audit revealed critical issues
3. Emergency 15-minute fix applied
4. Fixed code re-shipped

### What Should Have Happened
1. Run governor phases 1-4 FIRST
2. Catch issues in Phase 4 (Security)
3. Fix issues BEFORE contacting dev
4. Ship only after Phase 4 passes

### Rollback Cost
- **Time:** 15 minutes emergency repair
- **Reputation:** Risk of looking incompetent (mitigated by fast fix)
- **Stress:** High (racing against dev evaluation)

---

## Composability Check

### Skills That Should Have Been Called
- [ ] ❌ `coding/testing-strategy` (Phase 3) — NOT CALLED
- [ ] ❌ `security/*` (Phase 4) — Manual audit AFTER ship
- [ ] ❌ `deployment/*` (Phase 5) — N/A (not deployed, sent to dev)

### Skills That Were Called
- [ ] None (manual implementation, no governor execution)

---

## Root Cause Analysis

### Why This Happened
1. **"Quick scaffold" mindset:** Assumed this was trivial → skipped rigor
2. **Time pressure:** Wanted fast turnaround for bounty opportunity
3. **No formal process:** Didn't invoke coding-governor skill
4. **Optimism bias:** Assumed placeholders would be obvious → they weren't
5. **No pre-ship checklist:** Sent to dev without verification

### Failure Chain
```
Skip Phase 1 (Plan)
  → No clear success criteria
  → Assumed "scaffold + real integration later" was fine
  → Didn't realize it looked production-ready to others

Skip Phase 3 (Test)
  → No verification code worked
  → Shipped broken code (14 TS errors)

Skip Phase 4 (Security)
  → Shipped code with critical bugs
  → Had to emergency fix after dev received it

Skip Phase 5 (Ship checklist)
  → No smoke test
  → No health check
  → No verification it compiles
```

### The Compounding Error
Each skipped phase made the next failure more likely. By Phase 5, we were shipping code that:
- Didn't compile
- Had no tests
- Used placeholders instead of real integration
- Had 12 critical/high security issues

---

## Learnings

### 1. "Quick" is a Lie
**Symptom:** Thought this was a 2-hour scaffold  
**Reality:** 12+ hours with emergency fixes  
**Prevention:** ALWAYS use coding-governor for production code

### 2. Placeholders Look Like Real Code
**Symptom:** Scaffolds with TODO comments seemed fine  
**Reality:** Recipient assumes it's production-ready  
**Prevention:** Never send code with placeholders OR label clearly as "DRAFT"

### 3. Phase 4 Must Block Ship
**Symptom:** Sent code before security audit  
**Reality:** 12 critical/high issues found  
**Prevention:** Phase 4 is a HARD GATE (no exceptions)

### 4. Emergency Fixes Are Expensive
**Symptom:** 15-minute fix vs 4-6 hours estimated  
**Reality:** High stress, reputation risk, technical debt  
**Prevention:** Get it right the first time (use governor)

### 5. Time Pressure ≠ Skip Process
**Symptom:** "Dev is waiting, ship fast"  
**Reality:** Shipping broken code is slower than shipping correct code  
**Prevention:** Resist urgency bias, follow phases

---

## Corrective Actions

### Immediate (DONE)
- [x] Emergency fix applied (15 min)
- [x] All critical issues resolved
- [x] Code compiles cleanly
- [x] Real contract integration wired up
- [x] This post-mortem documented

### Short-Term (Next 24h)
- [ ] Add unit tests for all pure functions
- [ ] Add integration tests against mainnet fork
- [ ] Validate APY calculations against Resupply frontend
- [ ] Add input validation (isAddress checks)
- [ ] Test MCP server with real AI agent
- [ ] Test CLI against mainnet

### Long-Term (Next Week)
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Add ESLint + Prettier
- [ ] Add TypeScript strict mode
- [ ] Document RPC requirements in README
- [ ] Create Ship Report template for future projects

---

## Governor Verdict

### Phase Scores
- **Phase 1 (Plan):** ❌ FAIL (skipped entirely)
- **Phase 2 (Implement):** ❌ FAIL (placeholders, broken TS)
- **Phase 3 (Test):** ❌ CRITICAL FAIL (zero tests)
- **Phase 4 (Security):** ❌ CRITICAL FAIL (12 issues, done AFTER ship)
- **Phase 5 (Ship):** ❌ CRITICAL FAIL (shipped broken code)
- **Phase 6 (Report):** ⚠️ PARTIAL (retroactive only)

### Overall Grade
**FAIL — Would NOT have shipped if governor was enforced**

### What Would Have Happened With Governor
1. **Phase 1:** Plan would define "real integration, not placeholders"
2. **Phase 2:** Code would compile cleanly (contracts in src/)
3. **Phase 3:** Tests would exist and pass
4. **Phase 4:** Audit would catch 12 issues BEFORE contacting dev
5. **Phase 5:** Ship only after Phases 1-4 pass
6. **Phase 6:** Clean Ship Report with evidence

**Result:** Dev would receive production-ready code, not broken scaffold

---

## Mandatory Rule Going Forward

### THE CODING GOVERNOR LAW

**ANY production code MUST run through coding-governor phases.**

**"Production code" includes:**
- Anything sent to external parties (devs, clients, users)
- Anything deployed (VPS, Vercel, mainnet)
- Anything claiming to work (not labeled DRAFT)
- Anything tied to revenue ($500-10K bounty)

**NO EXCEPTIONS for:**
- "Quick scaffolds"
- "Time pressure"
- "Just a demo"
- "They'll understand"

**The 6 phases exist to prevent exactly what happened today.**

---

## Evidence

- **AUDIT.md:** Full audit (3 CRITICAL, 5 HIGH, 4 MEDIUM)
- **FIXES.md:** Emergency repair log
- **Commit e2509668:** Audit findings
- **Commit 699d5ebd:** Emergency fixes
- **This document:** Post-mortem analysis

---

**Audited:** 2026-02-27 13:15 PST  
**Auditor:** BAiSED (self-audit)  
**Verdict:** WOULD NOT HAVE SHIPPED  
**Lesson:** Use coding-governor for ALL production code, no exceptions.
