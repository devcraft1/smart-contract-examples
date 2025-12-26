# Security Vulnerability Report

This document outlines the security vulnerabilities and bugs found during code review.

## Critical Vulnerabilities

### 1. BookAService.sol - Owner Never Set (Line 15)
**Severity:** CRITICAL
**Location:** `contracts/BookAService.sol:15`

```solidity
// BUG: Uses == (comparison) instead of = (assignment)
owner == msg.sender;  // This does nothing!
```

**Impact:** The owner is never set, remaining `address(0)`. When `receive()` calls `owner.transfer()`, it attempts to send ETH to the zero address, which will revert. The contract is completely non-functional.

**Fix:** Change to `owner = msg.sender;`

---

### 2. DAO.sol - Integer Division Precision Loss (Line 121)
**Severity:** HIGH
**Location:** `contracts/DAO.sol:121`

```solidity
// BUG: Division before multiplication loses precision
(proposal.votes / totalShares) * 100 >= quorum
```

**Impact:** Due to integer division, `(50 / 100) * 100 = 0`, not 50. Proposals may never reach quorum even with majority votes.

**Fix:** Change to `(proposal.votes * 100) / totalShares >= quorum`

---

### 3. Dex.sol - Inverted Balance Logic (Lines 186-197)
**Severity:** CRITICAL
**Location:** `contracts/Dex.sol:186-197`

```solidity
if (side == Side.SELL) {
    // BUG: Subtracts DAI from seller instead of adding
    traderBalances[msg.sender][DAI] -= (matched * orders[i].price);
    // Should be: traderBalances[msg.sender][DAI] += (matched * orders[i].price);
}
```

**Impact:** When selling tokens, sellers LOSE DAI instead of receiving it. Funds are incorrectly transferred.

**Fix:** Invert the + and - operations for the SELL side.

---

### 4. MultiSignature.sol - Approval After Send Check (Lines 39-43)
**Severity:** HIGH
**Location:** `contracts/MultiSignature.sol:39-43`

```solidity
// BUG: Order is wrong - approval counted AFTER quorum check
if (transfers[id].approvals >= quorum) {
    // Send happens here
}
if (approvals[msg.sender][id] == false) {
    approvals[msg.sender][id] = true;
    transfers[id].approvals++;  // Too late!
}
```

**Impact:** Requires `quorum + 1` approvals instead of `quorum` approvals. The caller's approval isn't counted until after the send check.

**Fix:** Move the approval logic BEFORE the quorum check.

---

## High Severity Issues

### 5. Lottery.sol - Weak Randomness (Lines 52-56)
**Severity:** HIGH
**Location:** `contracts/Lottery.sol:52-56`

```solidity
function _randomModulo(uint256 modulo) internal view returns (uint256) {
    return uint256(
        keccak256(abi.encodePacked(block.timestamp, block.difficulty))
    ) % modulo;
}
```

**Issues:**
- `block.difficulty` returns 0 in PoS (post-merge)
- `block.timestamp` can be manipulated by validators (~15 seconds)
- Outcome is predictable

**Fix:** Use Chainlink VRF or commit-reveal scheme.

---

### 6. LendingPool.sol - Multiple Issues
**Severity:** HIGH
**Location:** `contracts/LendingPool.sol`

**Issues:**
1. **Division by zero** (lines 121-122, 144-147): If `totalSupply` is 0, calculations will revert
2. **No borrow limit check** (lines 99-110): Users can borrow more than available liquidity
3. **Overwriting records** (lines 89-90, 103-104): Second lend/borrow overwrites first instead of adding

---

### 7. Vault.sol - Division by Zero Risk (Line 34)
**Severity:** MEDIUM
**Location:** `contracts/Vault.sol:34`

```solidity
shares = (_amount * totalSupply) / token.balanceOf(address(this));
```

**Impact:** If vault's token balance is 0 but totalSupply > 0, this causes division by zero.

---

## Medium Severity Issues

### 8. User.sol - Early Return in Loop (Lines 35, 44)
**Severity:** MEDIUM
**Location:** `contracts/User.sol:35, 44`

```solidity
for (uint256 i = 0; i < user.length; i++) {
    if (user[i].id == id) { return user[i].name; }
    return "username not found";  // BUG: Returns on first non-match!
}
```

**Impact:** Can only find users at index 0. Any user at index > 0 returns "not found".

**Fix:** Move the "not found" return outside the loop.

---

### 9. Tinder.sol - Swipe Limit Logic Error (Lines 105-109)
**Severity:** MEDIUM
**Location:** `contracts/Tinder.sol:105-109`

```solidity
swipeSession.count = 100;  // Reset to 100
require(swipeSession.count <= 100, ...);  // Always passes!
swipeSession.count++;
```

**Impact:** Swipe limit is not enforced. Users can swipe unlimited times.

**Fix:** Reset count to 0 and check `>= 100`, or reset to 100 and check `> 100`.

---

### 10. Twitter.sol - No Operator Authorization
**Severity:** MEDIUM
**Location:** `contracts/Tweet.sol`

**Issue:** The `canOperate` modifier checks `operators[_from][msg.sender]`, but there's no function to set operators. No one can tweet or send messages.

**Fix:** Add an `authorize(address operator)` function.

---

## Low Severity Issues

### 11. Counter.sol - Underflow on Decrement
**Severity:** LOW
**Location:** `contracts/Counter.sol:16`

In Solidity 0.8+, `number--` when `number == 0` will revert with underflow. This might be unexpected behavior.

---

### 12. Missing SPDX License Identifiers
**Severity:** INFO
**Location:** Multiple files including `Lottery.sol`, `MultiSignature.sol`

Some contracts are missing the SPDX license identifier.

---

## Recommendations

1. **Use OpenZeppelin libraries** for standard patterns (ReentrancyGuard, Ownable, etc.)
2. **Add access control** to sensitive functions
3. **Implement checks-effects-interactions pattern** to prevent reentrancy
4. **Use Chainlink VRF** for randomness
5. **Add input validation** for all user inputs
6. **Consider using SafeMath** for older Solidity versions (though 0.8+ has built-in overflow checks)
7. **Add events** for state changes to enable monitoring
8. **Implement pausability** for emergency situations

---

## Files Not Reviewed (Commented Out)

- `ICO.sol` - Entirely commented out
- `TeslaApiConsumer.sol` - Entirely commented out
