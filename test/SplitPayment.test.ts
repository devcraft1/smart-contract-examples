import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SplitPayment", function () {
  async function deployFixture() {
    const [owner, recipient1, recipient2, recipient3, nonOwner] =
      await ethers.getSigners();

    const SplitPayment = await ethers.getContractFactory("SplitPayment");
    const splitPayment = await SplitPayment.deploy(owner.address);

    return { splitPayment, owner, recipient1, recipient2, recipient3, nonOwner };
  }

  describe("Deployment", function () {
    it("Should set owner correctly", async function () {
      const { splitPayment, owner } = await loadFixture(deployFixture);
      expect(await splitPayment.owner()).to.equal(owner.address);
    });
  });

  describe("send", function () {
    it("Should split payment to multiple recipients", async function () {
      const { splitPayment, owner, recipient1, recipient2 } = await loadFixture(
        deployFixture
      );

      const balance1Before = await ethers.provider.getBalance(recipient1.address);
      const balance2Before = await ethers.provider.getBalance(recipient2.address);

      await splitPayment.connect(owner).send(
        [recipient1.address, recipient2.address],
        [ethers.parseEther("1"), ethers.parseEther("2")],
        { value: ethers.parseEther("3") }
      );

      const balance1After = await ethers.provider.getBalance(recipient1.address);
      const balance2After = await ethers.provider.getBalance(recipient2.address);

      expect(balance1After - balance1Before).to.equal(ethers.parseEther("1"));
      expect(balance2After - balance2Before).to.equal(ethers.parseEther("2"));
    });

    it("Should send to single recipient", async function () {
      const { splitPayment, owner, recipient1 } = await loadFixture(
        deployFixture
      );

      const balanceBefore = await ethers.provider.getBalance(recipient1.address);
      await splitPayment.connect(owner).send(
        [recipient1.address],
        [ethers.parseEther("1")],
        { value: ethers.parseEther("1") }
      );
      const balanceAfter = await ethers.provider.getBalance(recipient1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if arrays have different lengths", async function () {
      const { splitPayment, owner, recipient1, recipient2 } = await loadFixture(
        deployFixture
      );

      await expect(
        splitPayment.connect(owner).send(
          [recipient1.address, recipient2.address],
          [ethers.parseEther("1")],
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("to and amount must be equal");
    });

    it("Should revert if not owner", async function () {
      const { splitPayment, nonOwner, recipient1 } = await loadFixture(
        deployFixture
      );

      await expect(
        splitPayment.connect(nonOwner).send(
          [recipient1.address],
          [ethers.parseEther("1")],
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("only owner can perform this transaction");
    });

    it("Should revert if not enough ether sent", async function () {
      const { splitPayment, owner, recipient1, recipient2 } = await loadFixture(
        deployFixture
      );

      await expect(
        splitPayment.connect(owner).send(
          [recipient1.address, recipient2.address],
          [ethers.parseEther("1"), ethers.parseEther("2")],
          { value: ethers.parseEther("1") }
        )
      ).to.be.reverted;
    });
  });
});
