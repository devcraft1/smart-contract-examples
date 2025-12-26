import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - Lottery.sol
 * ===================================
 * 1. WEAK RANDOMNESS (line 52-56):
 *    Uses block.timestamp and block.difficulty for randomness.
 *    - block.timestamp can be manipulated by miners (within ~15 seconds)
 *    - block.difficulty is DEPRECATED and returns 0 in PoS (post-merge)
 *    - Anyone can predict the outcome by calculating the hash
 *
 * 2. MISSING SPDX LICENSE IDENTIFIER
 *
 * IMPACT: Lottery outcome is predictable, can be exploited by miners/validators
 * RECOMMENDATION: Use Chainlink VRF or commit-reveal scheme for randomness
 */

describe("Lottery", function () {
  async function deployFixture() {
    const [admin, player1, player2, player3] = await ethers.getSigners();
    const houseFee = 10; // 10%

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(houseFee);

    return { lottery, admin, player1, player2, player3 };
  }

  describe("Deployment", function () {
    it("Should set admin correctly", async function () {
      const { lottery, admin } = await loadFixture(deployFixture);
      expect(await lottery.admin()).to.equal(admin.address);
    });

    it("Should set house fee correctly", async function () {
      const { lottery } = await loadFixture(deployFixture);
      expect(await lottery.houseFee()).to.equal(10);
    });

    it("Should start in IDLE state", async function () {
      const { lottery } = await loadFixture(deployFixture);
      expect(await lottery.currentState()).to.equal(0); // IDLE = 0
    });

    it("Should revert with invalid fee", async function () {
      const Lottery = await ethers.getContractFactory("Lottery");
      await expect(Lottery.deploy(0)).to.be.revertedWith(
        "fee should be between 1 and 99"
      );
      await expect(Lottery.deploy(100)).to.be.revertedWith(
        "fee should be between 1 and 99"
      );
    });
  });

  describe("createBet", function () {
    it("Should create a bet", async function () {
      const { lottery, admin } = await loadFixture(deployFixture);
      await lottery.connect(admin).createBet(3, ethers.parseEther("0.1"));
      expect(await lottery.betCount()).to.equal(3);
      expect(await lottery.betSize()).to.equal(ethers.parseEther("0.1"));
      expect(await lottery.currentState()).to.equal(1); // BETTING = 1
    });

    it("Should revert if not admin", async function () {
      const { lottery, player1 } = await loadFixture(deployFixture);
      await expect(
        lottery.connect(player1).createBet(3, ethers.parseEther("0.1"))
      ).to.be.revertedWith("only admin");
    });

    it("Should revert if not in IDLE state", async function () {
      const { lottery, admin } = await loadFixture(deployFixture);
      await lottery.connect(admin).createBet(3, ethers.parseEther("0.1"));
      await expect(
        lottery.connect(admin).createBet(3, ethers.parseEther("0.1"))
      ).to.be.revertedWith("current state does not allow this");
    });
  });

  describe("bet", function () {
    it("Should allow players to bet", async function () {
      const { lottery, admin, player1 } = await loadFixture(deployFixture);
      await lottery.connect(admin).createBet(3, ethers.parseEther("0.1"));
      await lottery
        .connect(player1)
        .bet({ value: ethers.parseEther("0.1") });
      expect(await lottery.players(0)).to.equal(player1.address);
    });

    it("Should revert with wrong bet size", async function () {
      const { lottery, admin, player1 } = await loadFixture(deployFixture);
      await lottery.connect(admin).createBet(3, ethers.parseEther("0.1"));
      await expect(
        lottery.connect(player1).bet({ value: ethers.parseEther("0.2") })
      ).to.be.revertedWith("can only bet exactly the bet size");
    });

    it("Should pick winner when bet count reached", async function () {
      const { lottery, admin, player1, player2, player3 } = await loadFixture(
        deployFixture
      );
      await lottery.connect(admin).createBet(3, ethers.parseEther("1"));

      await lottery.connect(player1).bet({ value: ethers.parseEther("1") });
      await lottery.connect(player2).bet({ value: ethers.parseEther("1") });

      // After 3rd player, winner is picked and state resets
      await lottery.connect(player3).bet({ value: ethers.parseEther("1") });

      expect(await lottery.currentState()).to.equal(0); // Back to IDLE
    });
  });

  describe("cancel", function () {
    it("Should cancel and refund players", async function () {
      const { lottery, admin, player1, player2 } = await loadFixture(
        deployFixture
      );
      await lottery.connect(admin).createBet(3, ethers.parseEther("1"));

      await lottery.connect(player1).bet({ value: ethers.parseEther("1") });
      await lottery.connect(player2).bet({ value: ethers.parseEther("1") });

      const balanceBefore = await ethers.provider.getBalance(player1.address);
      await lottery.connect(admin).cancel();
      const balanceAfter = await ethers.provider.getBalance(player1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1"));
      expect(await lottery.currentState()).to.equal(0); // Back to IDLE
    });

    it("Should revert if not admin", async function () {
      const { lottery, admin, player1 } = await loadFixture(deployFixture);
      await lottery.connect(admin).createBet(3, ethers.parseEther("0.1"));
      await expect(lottery.connect(player1).cancel()).to.be.revertedWith(
        "only admin"
      );
    });
  });

  describe("VULNERABILITY: Weak Randomness", function () {
    it("Randomness uses predictable block.timestamp and deprecated block.difficulty", async function () {
      // This test documents the vulnerability
      // In a real attack, a miner could predict or manipulate the outcome
      const { lottery, admin, player1, player2, player3 } = await loadFixture(
        deployFixture
      );

      await lottery.connect(admin).createBet(3, ethers.parseEther("0.01"));
      await lottery.connect(player1).bet({ value: ethers.parseEther("0.01") });
      await lottery.connect(player2).bet({ value: ethers.parseEther("0.01") });
      // Winner is determined by block.timestamp and block.difficulty (which is 0 in PoS)
      await lottery.connect(player3).bet({ value: ethers.parseEther("0.01") });

      // The randomness source is weak and predictable
      // block.difficulty = 0 in PoS, making hash only depend on timestamp
      expect(await lottery.currentState()).to.equal(0);
    });
  });
});
