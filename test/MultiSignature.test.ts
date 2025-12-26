import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

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

  describe("sendTransfer", function () {
    it("Should send transfer when quorum is reached", async function () {
      const { wallet, approver1, approver2, recipient } =
        await loadFixture(deployFixture);

      await wallet
        .connect(approver1)
        .createTransfer(ethers.parseEther("1"), recipient.address);

      await wallet.connect(approver1).sendTransfer(0);

      const balanceBefore = await ethers.provider.getBalance(recipient.address);
      await wallet.connect(approver2).sendTransfer(0);
      const balanceAfter = await ethers.provider.getBalance(recipient.address);

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

      await expect(
        wallet.connect(approver3).sendTransfer(0)
      ).to.be.revertedWith("transfer has already been sent");
    });
  });
});
