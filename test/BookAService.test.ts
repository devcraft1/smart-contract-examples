import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BookAService", function () {
  async function deployFixture() {
    const [owner, customer] = await ethers.getSigners();
    const BookAService = await ethers.getContractFactory("BookAService");
    const service = await BookAService.deploy();
    return { service, owner, customer };
  }

  describe("Deployment", function () {
    it("Should set owner correctly", async function () {
      const { service, owner } = await loadFixture(deployFixture);
      expect(await service.owner()).to.equal(owner.address);
    });
  });

  describe("receive", function () {
    it("Should send ether to owner when booking", async function () {
      const { service, owner, customer } = await loadFixture(deployFixture);
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await customer.sendTransaction({
        to: await service.getAddress(),
        value: ethers.parseEther("2"),
      });
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(ethers.parseEther("2"));
    });

    it("Should revert when sending less than 2 ether", async function () {
      const { service, customer } = await loadFixture(deployFixture);
      await expect(
        customer.sendTransaction({
          to: await service.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Not enough Ether provided.");
    });
  });
});
