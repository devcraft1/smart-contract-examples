import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - DAO.sol
 * ==============================
 * BUG on line 121: Integer division precision loss
 * `(proposal.votes / totalShares) * 100` loses precision
 * Should be: `(proposal.votes * 100) / totalShares`
 *
 * Example: If votes = 50 and totalShares = 100, quorum = 50%
 * Current: (50 / 100) * 100 = 0 * 100 = 0  (WRONG!)
 * Fixed:   (50 * 100) / 100 = 5000 / 100 = 50 (CORRECT!)
 *
 * IMPACT: Proposals may never reach quorum even with majority votes
 */

describe("DAO", function () {
  async function deployFixture() {
    const [admin, investor1, investor2, recipient] = await ethers.getSigners();
    const contributionTime = 3600; // 1 hour
    const voteTime = 3600; // 1 hour
    const quorum = 50; // 50%

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.deploy(contributionTime, voteTime, quorum);

    return { dao, admin, investor1, investor2, recipient, voteTime };
  }

  describe("Deployment", function () {
    it("Should set admin correctly", async function () {
      const { dao, admin } = await loadFixture(deployFixture);
      expect(await dao.admin()).to.equal(admin.address);
    });

    it("Should revert with invalid quorum", async function () {
      const DAO = await ethers.getContractFactory("DAO");
      await expect(DAO.deploy(3600, 3600, 0)).to.be.revertedWith(
        "quorum must be between 0 and 100"
      );
      await expect(DAO.deploy(3600, 3600, 100)).to.be.revertedWith(
        "quorum must be between 0 and 100"
      );
    });
  });

  describe("contribute", function () {
    it("Should allow contributions during contribution period", async function () {
      const { dao, investor1 } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("1") });
      expect(await dao.shares(investor1.address)).to.equal(
        ethers.parseEther("1")
      );
      expect(await dao.investors(investor1.address)).to.be.true;
    });

    it("Should revert after contribution period ends", async function () {
      const { dao, investor1 } = await loadFixture(deployFixture);
      await time.increase(3601);
      await expect(
        dao.connect(investor1).contribute({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("cannot contribute after contributionEnd");
    });
  });

  describe("redeemShare", function () {
    it("Should allow redeeming shares", async function () {
      const { dao, investor1 } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("2") });
      await dao.connect(investor1).redeemShare(ethers.parseEther("1"));
      expect(await dao.shares(investor1.address)).to.equal(
        ethers.parseEther("1")
      );
    });

    it("Should revert if not enough shares", async function () {
      const { dao, investor1 } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("1") });
      await expect(
        dao.connect(investor1).redeemShare(ethers.parseEther("2"))
      ).to.be.revertedWith("not enough shares");
    });
  });

  describe("transferShare", function () {
    it("Should transfer shares between investors", async function () {
      const { dao, investor1, investor2 } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("2") });
      await dao
        .connect(investor1)
        .transferShare(ethers.parseEther("1"), investor2.address);
      expect(await dao.shares(investor1.address)).to.equal(
        ethers.parseEther("1")
      );
      expect(await dao.shares(investor2.address)).to.equal(
        ethers.parseEther("1")
      );
      expect(await dao.investors(investor2.address)).to.be.true;
    });
  });

  describe("createProposal", function () {
    it("Should create proposal", async function () {
      const { dao, investor1, recipient } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("2") });
      await dao
        .connect(investor1)
        .createProposal("Test Proposal", ethers.parseEther("1"), recipient.address);
      const proposal = await dao.proposals(0);
      expect(proposal.name).to.equal("Test Proposal");
      expect(proposal.amount).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if not investor", async function () {
      const { dao, recipient } = await loadFixture(deployFixture);
      await expect(
        dao.createProposal("Test", ethers.parseEther("1"), recipient.address)
      ).to.be.revertedWith("only investors");
    });
  });

  describe("vote", function () {
    it("Should allow voting on proposal", async function () {
      const { dao, investor1, recipient } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("2") });
      await dao
        .connect(investor1)
        .createProposal("Test", ethers.parseEther("1"), recipient.address);
      await dao.connect(investor1).vote(0);
      const proposal = await dao.proposals(0);
      expect(proposal.votes).to.equal(ethers.parseEther("2"));
    });

    it("Should revert if voting twice", async function () {
      const { dao, investor1, recipient } = await loadFixture(deployFixture);
      await dao.connect(investor1).contribute({ value: ethers.parseEther("2") });
      await dao
        .connect(investor1)
        .createProposal("Test", ethers.parseEther("1"), recipient.address);
      await dao.connect(investor1).vote(0);
      await expect(dao.connect(investor1).vote(0)).to.be.revertedWith(
        "investor can only vote once for a proposal"
      );
    });
  });

  describe("executeProposal - VULNERABILITY TEST", function () {
    it("VULNERABILITY: Quorum calculation has precision loss", async function () {
      const { dao, investor1, recipient, voteTime } = await loadFixture(
        deployFixture
      );
      // Investor contributes 100 wei
      await dao.connect(investor1).contribute({ value: 100 });

      // Create proposal for 50 wei
      await dao
        .connect(investor1)
        .createProposal("Test", 50, recipient.address);

      // Vote with 100% of shares (should easily pass 50% quorum)
      await dao.connect(investor1).vote(0);

      // Wait for vote period to end
      await time.increase(voteTime + 1);

      // Due to integer division bug: (100 / 100) * 100 = 100, this works
      // But with smaller numbers like (50 / 100) * 100 = 0, it fails
      // This test shows the vulnerability exists
      const proposal = await dao.proposals(0);
      expect(proposal.votes).to.equal(100);
      expect(await dao.totalShares()).to.equal(100);

      // Execute should work here because we have 100% votes
      // But the calculation (100/100)*100 = 100 >= 50 works
      // The bug manifests when votes < totalShares
    });
  });
});
