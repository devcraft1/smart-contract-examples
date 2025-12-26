import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("Voting", function () {
  async function deployFixture() {
    const [admin, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting, admin, voter1, voter2, voter3, nonVoter };
  }

  describe("Deployment", function () {
    it("Should set admin correctly", async function () {
      const { voting, admin } = await loadFixture(deployFixture);
      expect(await voting.admin()).to.equal(admin.address);
    });
  });

  describe("addVoters", function () {
    it("Should add voters", async function () {
      const { voting, admin, voter1, voter2 } = await loadFixture(deployFixture);

      await voting.connect(admin).addVoters([voter1.address, voter2.address]);

      expect(await voting.voters(voter1.address)).to.be.true;
      expect(await voting.voters(voter2.address)).to.be.true;
    });

    it("Should revert if not admin", async function () {
      const { voting, voter1 } = await loadFixture(deployFixture);

      await expect(
        voting.connect(voter1).addVoters([voter1.address])
      ).to.be.revertedWith("only admin");
    });
  });

  describe("createBallot", function () {
    it("Should create a ballot", async function () {
      const { voting, admin } = await loadFixture(deployFixture);

      await voting
        .connect(admin)
        .createBallot("Best Language", ["Solidity", "Rust", "Go"], 3600);

      // Ballot created - no direct getter, but vote should work
    });

    it("Should revert if not admin", async function () {
      const { voting, voter1 } = await loadFixture(deployFixture);

      await expect(
        voting
          .connect(voter1)
          .createBallot("Test", ["A", "B"], 3600)
      ).to.be.revertedWith("only admin");
    });
  });

  describe("vote", function () {
    it("Should allow voter to vote", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployFixture);

      await voting.connect(admin).addVoters([voter1.address]);
      await voting
        .connect(admin)
        .createBallot("Test", ["Option A", "Option B"], 3600);

      await voting.connect(voter1).vote(0, 0);

      // Vote counted - check in results
    });

    it("Should revert if not a voter", async function () {
      const { voting, admin, nonVoter } = await loadFixture(deployFixture);

      await voting
        .connect(admin)
        .createBallot("Test", ["Option A", "Option B"], 3600);

      await expect(voting.connect(nonVoter).vote(0, 0)).to.be.revertedWith(
        "only voters can vote"
      );
    });

    it("Should revert if voting twice on same ballot", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployFixture);

      await voting.connect(admin).addVoters([voter1.address]);
      await voting
        .connect(admin)
        .createBallot("Test", ["Option A", "Option B"], 3600);

      await voting.connect(voter1).vote(0, 0);

      await expect(voting.connect(voter1).vote(0, 1)).to.be.revertedWith(
        "voter can only vote once for a ballot"
      );
    });

    it("Should revert if ballot ended", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployFixture);

      await voting.connect(admin).addVoters([voter1.address]);
      await voting.connect(admin).createBallot("Test", ["Option A", "Option B"], 1);

      await time.increase(2);

      await expect(voting.connect(voter1).vote(0, 0)).to.be.revertedWith(
        "can only vote until ballot end date"
      );
    });
  });

  describe("results", function () {
    it("Should return results after ballot ends", async function () {
      const { voting, admin, voter1, voter2 } = await loadFixture(deployFixture);

      await voting.connect(admin).addVoters([voter1.address, voter2.address]);
      await voting
        .connect(admin)
        .createBallot("Test", ["Option A", "Option B"], 3600);

      await voting.connect(voter1).vote(0, 0);
      await voting.connect(voter2).vote(0, 1);

      await time.increase(3601);

      const results = await voting.results(0);
      expect(results[0].votes).to.equal(1);
      expect(results[1].votes).to.equal(1);
    });

    it("Should revert if ballot not ended", async function () {
      const { voting, admin } = await loadFixture(deployFixture);

      await voting
        .connect(admin)
        .createBallot("Test", ["Option A", "Option B"], 3600);

      await expect(voting.results(0)).to.be.revertedWith(
        "cannot see the ballot result before ballot end"
      );
    });
  });
});
