import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - MultiSignature.sol (Wallet contract in file)
 * ====================================================================
 * BUG on lines 39-43: Approval logic is AFTER the send check
 *
 * Current order (WRONG):
 * 1. Check if approvals >= quorum -> send
 * 2. Then check if user already approved -> add approval
 *
 * Correct order should be:
 * 1. Check if user already approved -> add approval
 * 2. Then check if approvals >= quorum -> send
 *
 * IMPACT: First call to sendTransfer won't count the caller's approval
 * The transfer can only be sent on a SUBSEQUENT call after quorum is reached
 *
 * Example with quorum=2:
 * - Approver1 calls sendTransfer: approvals becomes 1 (after check)
 * - Approver2 calls sendTransfer: checks if 1 >= 2 (false), then approvals becomes 2
 * - Approver3 must call: checks if 2 >= 2 (true), sends transfer
 * - So it needs quorum+1 calls instead of quorum calls!
 */

describe("Wallet (MultiSignature)", function () {
  async function deployFixture() {
    const [deployer, approver1, approver2, approver3, recipient] =
      await ethers.getSigners();
    const quorum = 2;

    // Note: The contract in MultiSignature.sol is named "Wallet"
    const Wallet = await ethers.getContractFactory("contracts/MultiSignature.sol:Wallet");
    const wallet = await Wallet.deploy(
      [approver1.address, approver2.address, approver3.address],
      quorum,
      { value: ethers.parseEther("10") }
    );

    return { wallet, deployer, approver1, approver2, approver3, recipient, quorum };
  }

  describe("Deployment", function () {
    it("Should set approvers correctly", async function () {
      const { wallet, approver1, approver2, approver3 } = await loadFixture(
        deployFixture
      );
      expect(await wallet.approvers(0)).to.equal(approver1.address);
      expect(await wallet.approvers(1)).to.equal(approver2.address);
      expect(await wallet.approvers(2)).to.equal(approver3.address);
    });

    it("Should set quorum correctly", async function () {
      const { wallet, quorum } = await loadFixture(deployFixture);
      expect(await wallet.quorum()).to.equal(quorum);
    });

    it("Should receive initial funds", async function () {
      const { wallet } = await loadFixture(deployFixture);
      expect(
        await ethers.provider.getBalance(await wallet.getAddress())
      ).to.equal(ethers.parseEther("10"));
    });
  });

  describe("createTransfer", function () {
    it("Should create a transfer request", async function () {
      const { wallet, approver1, recipient } = await loadFixture(deployFixture);
      await wallet
        .connect(approver1)
        .createTransfer(ethers.parseEther("1"), recipient.address);
      // Transfer created with id 0
    });

    it("Should revert if not approver", async function () {
      const { wallet, recipient } = await loadFixture(deployFixture);
      await expect(
        wallet.createTransfer(ethers.parseEther("1"), recipient.address)
      ).to.be.revertedWith("only approver allowed");
    });
  });

  describe("sendTransfer - VULNERABILITY TEST", function () {
    it("VULNERABILITY: Needs quorum+1 approvals due to bug", async function () {
      const { wallet, approver1, approver2, approver3, recipient } =
        await loadFixture(deployFixture);

      // Create transfer
      await wallet
        .connect(approver1)
        .createTransfer(ethers.parseEther("1"), recipient.address);

      // Approver1 approves - after this call, approvals = 1
      // (approval is counted AFTER the quorum check)
      await wallet.connect(approver1).sendTransfer(0);

      // Approver2 approves - checks if 1 >= 2 (false), then approvals = 2
      await wallet.connect(approver2).sendTransfer(0);

      // BUG: Transfer should have been sent after approver2 (quorum=2)
      // But it wasn't because approval count happens AFTER the send check

      // Approver3 must also call - checks if 2 >= 2 (true), sends!
      const balanceBefore = await ethers.provider.getBalance(recipient.address);
      await wallet.connect(approver3).sendTransfer(0);
      const balanceAfter = await ethers.provider.getBalance(recipient.address);

      // Transfer finally sent
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if not approver", async function () {
      const { wallet, approver1, recipient } = await loadFixture(deployFixture);
      await wallet
        .connect(approver1)
        .createTransfer(ethers.parseEther("1"), recipient.address);

      await expect(wallet.sendTransfer(0)).to.be.revertedWith(
        "only approver allowed"
      );
    });

    it("Should revert if already sent", async function () {
      const { wallet, approver1, approver2, approver3, recipient } =
        await loadFixture(deployFixture);

      await wallet
        .connect(approver1)
        .createTransfer(ethers.parseEther("1"), recipient.address);

      await wallet.connect(approver1).sendTransfer(0);
      await wallet.connect(approver2).sendTransfer(0);
      await wallet.connect(approver3).sendTransfer(0); // This sends

      await expect(
        wallet.connect(approver1).sendTransfer(0)
      ).to.be.revertedWith("transfer has already been sent");
    });
  });
});
