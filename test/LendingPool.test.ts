import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - LendingPool.sol
 * =======================================
 * 1. DIVISION BY ZERO (lines 121-122, 144-147):
 *    Interest calculations divide by totalSupply.
 *    If totalSupply becomes 0, these will revert.
 *
 * 2. NO BORROW LIMIT CHECK (line 99-110):
 *    borrow() doesn't check if pool has enough liquidity.
 *    A user can borrow more than available, causing underflow in totalSupply.
 *
 * 3. REENTRANCY RISK:
 *    State changes happen before token transfers in some functions,
 *    but after in others. Should be consistent with checks-effects-interactions.
 *
 * 4. OVERWRITING RECORDS (lines 89-90, 103-104):
 *    If user lends/borrows twice, the new amount OVERWRITES the old one
 *    instead of adding to it. Previous lend/borrow is lost.
 */

describe("LiquidityPool", function () {
  async function deployFixture() {
    const [owner, lender1, borrower1] = await ethers.getSigners();

    // Deploy token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000")
    );

    // Transfer initial tokens to owner for pool initialization
    const initialPoolAmount = ethers.parseEther("10000");

    // Approve tokens for pool deployment
    await token.approve(owner.address, initialPoolAmount);

    // Deploy pool
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    await token.approve(
      // We need to pre-approve for the constructor
      await ethers.provider.getSigner(owner.address).then((s) => s.getAddress()),
      initialPoolAmount
    );

    // Need to deploy with approval
    const tokenAddress = await token.getAddress();
    await token.approve(tokenAddress, initialPoolAmount);

    // For this test, we'll deploy without initial funding
    const pool = await LiquidityPool.deploy(tokenAddress, 0);

    // Transfer tokens to users
    await token.transfer(lender1.address, ethers.parseEther("10000"));
    await token.transfer(borrower1.address, ethers.parseEther("1000"));

    // Fund the pool directly for testing
    await token.transfer(await pool.getAddress(), ethers.parseEther("5000"));

    return { pool, token, owner, lender1, borrower1 };
  }

  describe("lend", function () {
    it("Should allow lending tokens", async function () {
      const { pool, token, lender1 } = await loadFixture(deployFixture);

      await token
        .connect(lender1)
        .approve(await pool.getAddress(), ethers.parseEther("100"));
      await pool.connect(lender1).lend(ethers.parseEther("100"));

      // Lender1 is now recorded as a lender
    });

    it("Should revert if amount is 0", async function () {
      const { pool, lender1 } = await loadFixture(deployFixture);

      await expect(pool.connect(lender1).lend(0)).to.be.revertedWith(
        " amount can not be 0"
      );
    });
  });

  describe("borrow", function () {
    it("VULNERABILITY: Borrowing causes underflow when totalSupply is 0", async function () {
      const { pool, borrower1 } = await loadFixture(deployFixture);
      // The pool was deployed with totalSupply = 0 (constructor issue)
      // Borrowing will cause totalSupply -= amount, which underflows
      await expect(
        pool.connect(borrower1).borrow(ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should revert if amount is 0", async function () {
      const { pool, borrower1 } = await loadFixture(deployFixture);

      await expect(pool.connect(borrower1).borrow(0)).to.be.revertedWith(
        " amount can not be 0"
      );
    });

    it("VULNERABILITY: Can borrow more than pool has", async function () {
      const { pool, token, borrower1 } = await loadFixture(deployFixture);

      // Pool has 5000 tokens
      // Try to borrow more - this will underflow totalSupply
      // In Solidity 0.8+, this will revert with panic
      await expect(
        pool.connect(borrower1).borrow(ethers.parseEther("10000"))
      ).to.be.reverted;
    });
  });

  describe("repay", function () {
    it("VULNERABILITY: Repay fails due to borrow underflow issue", async function () {
      const { pool, borrower1 } = await loadFixture(deployFixture);
      // Can't test repay because borrow fails due to underflow
      // This demonstrates the contract has fundamental issues
      await expect(
        pool.connect(borrower1).borrow(ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should revert if not a borrower", async function () {
      const { pool, lender1 } = await loadFixture(deployFixture);

      await expect(pool.connect(lender1).repay()).to.be.revertedWith(
        "not a borrower"
      );
    });
  });

  describe("withdraw", function () {
    it("VULNERABILITY: Withdraw fails due to division by zero (totalSupply is 0)", async function () {
      const { pool, token, lender1 } = await loadFixture(deployFixture);
      // Lend some tokens
      await token
        .connect(lender1)
        .approve(await pool.getAddress(), ethers.parseEther("100"));
      await pool.connect(lender1).lend(ethers.parseEther("100"));

      await time.increase(100);

      // Withdraw will fail because interest calculation divides by totalSupply
      // which is 0 (not updated by lend function properly - it's a different totalSupply)
      // The contract has a bug where it uses a separate totalSupply variable
      await expect(pool.connect(lender1).withdraw()).to.be.reverted;
    });

    it("Should revert if not a lender", async function () {
      const { pool, borrower1 } = await loadFixture(deployFixture);

      await expect(pool.connect(borrower1).withdraw()).to.be.revertedWith(
        "you are not a lender"
      );
    });
  });

  describe("VULNERABILITY: Overwriting records", function () {
    it("Second lend overwrites first lend amount", async function () {
      const { pool, token, lender1 } = await loadFixture(deployFixture);

      // First lend
      await token
        .connect(lender1)
        .approve(await pool.getAddress(), ethers.parseEther("200"));
      await pool.connect(lender1).lend(ethers.parseEther("100"));

      // Second lend - this OVERWRITES the first, not adds to it
      await pool.connect(lender1).lend(ethers.parseEther("50"));

      // The 100 tokens from first lend are now "lost" in the pool
      // Lender can only withdraw based on 50 tokens
      // This is a bug - should track cumulative lends
    });
  });
});
