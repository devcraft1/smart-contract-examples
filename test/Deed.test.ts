import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("Deed", function () {
  async function deployFixture() {
    const [deployer, lawyer, beneficiary] = await ethers.getSigners();
    const fromNow = 3600; // 1 hour

    const Deed = await ethers.getContractFactory("Deed");
    const deed = await Deed.deploy(lawyer.address, beneficiary.address, fromNow, {
      value: ethers.parseEther("1"),
    });

    return { deed, deployer, lawyer, beneficiary, fromNow };
  }

  describe("Deployment", function () {
    it("Should receive ether on deployment", async function () {
      const { deed } = await loadFixture(deployFixture);
      expect(await ethers.provider.getBalance(await deed.getAddress())).to.equal(
        ethers.parseEther("1")
      );
    });
  });

  describe("withdraw", function () {
    it("Should allow lawyer to withdraw after time", async function () {
      const { deed, lawyer, beneficiary, fromNow } = await loadFixture(
        deployFixture
      );

      await time.increase(fromNow + 1);

      const balanceBefore = await ethers.provider.getBalance(beneficiary.address);
      await deed.connect(lawyer).withdraw();
      const balanceAfter = await ethers.provider.getBalance(beneficiary.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if not lawyer", async function () {
      const { deed, beneficiary, fromNow } = await loadFixture(deployFixture);
      await time.increase(fromNow + 1);
      await expect(deed.connect(beneficiary).withdraw()).to.be.revertedWith(
        "lawyer only"
      );
    });

    it("Should revert if too early", async function () {
      const { deed, lawyer } = await loadFixture(deployFixture);
      await expect(deed.connect(lawyer).withdraw()).to.be.revertedWith(
        "too early"
      );
    });
  });
});
