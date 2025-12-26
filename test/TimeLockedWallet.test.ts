import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("Timelock", function () {
  async function deployFixture() {
    const [deployer, owner, otherAccount] = await ethers.getSigners();
    const duration = 3600; // 1 hour

    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy(owner.address, duration);

    return { timelock, deployer, owner, otherAccount, duration };
  }

  describe("Deployment", function () {
    it("Should set owner correctly", async function () {
      const { timelock, owner } = await loadFixture(deployFixture);
      expect(await timelock.owner()).to.equal(owner.address);
    });

    it("Should set duration correctly", async function () {
      const { timelock, duration } = await loadFixture(deployFixture);
      expect(await timelock.duration()).to.equal(duration);
    });

    it("Should have Locked status initially", async function () {
      const { timelock } = await loadFixture(deployFixture);
      expect(await timelock.status()).to.equal("Locked");
    });
  });

  describe("deposit", function () {
    it("Should accept deposits", async function () {
      const { timelock, otherAccount } = await loadFixture(deployFixture);

      await timelock
        .connect(otherAccount)
        .deposit({ value: ethers.parseEther("1") });

      expect(
        await ethers.provider.getBalance(await timelock.getAddress())
      ).to.equal(ethers.parseEther("1"));
    });

    it("Should accept deposits via receive", async function () {
      const { timelock, otherAccount } = await loadFixture(deployFixture);

      await otherAccount.sendTransaction({
        to: await timelock.getAddress(),
        value: ethers.parseEther("1"),
      });

      expect(
        await ethers.provider.getBalance(await timelock.getAddress())
      ).to.equal(ethers.parseEther("1"));
    });
  });

  describe("withdraw", function () {
    it("Should allow owner to withdraw after lock period", async function () {
      const { timelock, owner, otherAccount, duration } = await loadFixture(
        deployFixture
      );

      await timelock
        .connect(otherAccount)
        .deposit({ value: ethers.parseEther("1") });

      await time.increase(duration + 1);

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await timelock.connect(owner).withdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      // Owner received the funds (minus gas)
      expect(balanceAfter).to.be.gt(balanceBefore);
      expect(await timelock.status()).to.equal("withdrawn");
    });

    it("Should revert if not owner", async function () {
      const { timelock, otherAccount, duration } = await loadFixture(
        deployFixture
      );

      await timelock
        .connect(otherAccount)
        .deposit({ value: ethers.parseEther("1") });

      await time.increase(duration + 1);

      await expect(
        timelock.connect(otherAccount).withdraw()
      ).to.be.revertedWith("only owner can withdraw");
    });

    it("Should revert if too early", async function () {
      const { timelock, owner, otherAccount } = await loadFixture(deployFixture);

      await timelock
        .connect(otherAccount)
        .deposit({ value: ethers.parseEther("1") });

      await expect(timelock.connect(owner).withdraw()).to.be.revertedWith(
        "too early"
      );
    });
  });

  describe("getBalance", function () {
    it("Should return balance for owner", async function () {
      const { timelock, owner, otherAccount } = await loadFixture(deployFixture);

      await timelock
        .connect(otherAccount)
        .deposit({ value: ethers.parseEther("1") });

      expect(await timelock.connect(owner).getBalance()).to.equal(
        ethers.parseEther("1")
      );
    });

    it("Should revert if not owner", async function () {
      const { timelock, otherAccount } = await loadFixture(deployFixture);

      await timelock
        .connect(otherAccount)
        .deposit({ value: ethers.parseEther("1") });

      await expect(
        timelock.connect(otherAccount).getBalance()
      ).to.be.revertedWith("only owner can view this");
    });
  });
});
