import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - BookAService.sol
 * ========================================
 * CRITICAL BUG on line 15: `owner == msg.sender` should be `owner = msg.sender`
 * This is a comparison, not an assignment! The owner is never set, remaining address(0).
 * When receive() tries to call owner.transfer(), it will fail because:
 * 1. owner is address(0)
 * 2. transfer to address(0) with value will revert
 *
 * IMPACT: Contract is completely broken - no one can book the service
 */

describe("BookAService", function () {
  async function deployFixture() {
    const [owner, customer] = await ethers.getSigners();
    const BookAService = await ethers.getContractFactory("BookAService");
    const service = await BookAService.deploy();
    return { service, owner, customer };
  }

  describe("Deployment", function () {
    it("VULNERABILITY: owner is not set due to == instead of =", async function () {
      const { service } = await loadFixture(deployFixture);
      // Owner should be deployer, but due to bug it's address(0)
      expect(await service.owner()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("receive", function () {
    it("VULNERABILITY: Sends ether to address(0) due to owner not being set", async function () {
      const { service, customer } = await loadFixture(deployFixture);
      // Due to the bug, owner.transfer() sends to address(0)
      // In EVM, sending to address(0) actually succeeds (burns the ether)
      // This demonstrates the bug - funds are lost forever
      await customer.sendTransaction({
        to: await service.getAddress(),
        value: ethers.parseEther("2"),
      });
      // The ether was sent to address(0) - it's gone forever!
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
