import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("DeedMultiPayout", function () {
  async function deployFixture() {
    const [deployer, lawyer, beneficiary] = await ethers.getSigners();
    const fromNow = 100; // 100 seconds

    const DeedMultiPayout = await ethers.getContractFactory("DeedMultiPayout");
    const deed = await DeedMultiPayout.deploy(
      lawyer.address,
      beneficiary.address,
      fromNow,
      { value: ethers.parseEther("10") }
    );

    return { deed, deployer, lawyer, beneficiary, fromNow };
  }

  describe("Deployment", function () {
    it("Should set correct parameters", async function () {
      const { deed, lawyer, beneficiary } = await loadFixture(deployFixture);
      expect(await deed.lawyer()).to.equal(lawyer.address);
      expect(await deed.beneficiary()).to.equal(beneficiary.address);
      expect(await deed.amount()).to.equal(ethers.parseEther("1")); // 10 ETH / 10 payouts
    });
  });

  describe("withdraw", function () {
    it("Should allow beneficiary to withdraw after earliest", async function () {
      const { deed, beneficiary, fromNow } = await loadFixture(deployFixture);

      // Wait for earliest + at least 1 interval (INTERVAL = 10 seconds)
      await time.increase(fromNow + 11);

      const deedBalance = await ethers.provider.getBalance(await deed.getAddress());
      expect(deedBalance).to.equal(ethers.parseEther("10"));

      await deed.connect(beneficiary).withdraw();

      // Check that payouts were made
      expect(await deed.paidPayouts()).to.be.gte(1);
    });

    it("Should revert if not beneficiary", async function () {
      const { deed, lawyer, fromNow } = await loadFixture(deployFixture);
      await time.increase(fromNow + 1);
      await expect(deed.connect(lawyer).withdraw()).to.be.revertedWith(
        "beneficiary only"
      );
    });

    it("Should revert if too early", async function () {
      const { deed, beneficiary } = await loadFixture(deployFixture);
      await expect(deed.connect(beneficiary).withdraw()).to.be.revertedWith(
        "too early"
      );
    });

    it("Should allow multiple payouts over time", async function () {
      const { deed, beneficiary, fromNow } = await loadFixture(deployFixture);

      // Wait for first payout
      await time.increase(fromNow + 11); // +1 interval

      await deed.connect(beneficiary).withdraw();
      expect(await deed.paidPayouts()).to.be.gte(1);

      // Wait for more intervals
      await time.increase(50); // 5 more intervals

      await deed.connect(beneficiary).withdraw();
      expect(await deed.paidPayouts()).to.be.gte(2);
    });

    it("Should revert when all payouts done", async function () {
      const { deed, beneficiary, fromNow } = await loadFixture(deployFixture);

      // Wait for all 10 payouts to be eligible
      await time.increase(fromNow + 100); // 10 intervals

      await deed.connect(beneficiary).withdraw();
      expect(await deed.paidPayouts()).to.equal(10);

      await expect(deed.connect(beneficiary).withdraw()).to.be.revertedWith(
        "no payout left"
      );
    });
  });
});
