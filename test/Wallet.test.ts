import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Wallet (Simple)", function () {
  async function deployFixture() {
    const [deployer, owner, recipient, nonOwner] = await ethers.getSigners();

    // Note: This is the Wallet contract from Wallet.sol (not MultiSignature.sol)
    const Wallet = await ethers.getContractFactory("contracts/Wallet.sol:Wallet");
    const wallet = await Wallet.deploy(owner.address);

    return { wallet, deployer, owner, recipient, nonOwner };
  }

  describe("Deployment", function () {
    it("Should set owner correctly", async function () {
      const { wallet, owner } = await loadFixture(deployFixture);
      expect(await wallet.owner()).to.equal(owner.address);
    });
  });

  describe("deposit", function () {
    it("Should accept deposits", async function () {
      const { wallet, nonOwner } = await loadFixture(deployFixture);

      await wallet.connect(nonOwner).deposit({ value: ethers.parseEther("1") });

      expect(await wallet.balanceOf()).to.equal(ethers.parseEther("1"));
    });

    it("Should accept multiple deposits", async function () {
      const { wallet, owner, nonOwner } = await loadFixture(deployFixture);

      await wallet.connect(nonOwner).deposit({ value: ethers.parseEther("1") });
      await wallet.connect(owner).deposit({ value: ethers.parseEther("2") });

      expect(await wallet.balanceOf()).to.equal(ethers.parseEther("3"));
    });
  });

  describe("send", function () {
    it("Should allow owner to send funds", async function () {
      const { wallet, owner, recipient, nonOwner } = await loadFixture(
        deployFixture
      );

      await wallet.connect(nonOwner).deposit({ value: ethers.parseEther("5") });

      const balanceBefore = await ethers.provider.getBalance(recipient.address);
      await wallet.connect(owner).send(recipient.address, ethers.parseEther("2"));
      const balanceAfter = await ethers.provider.getBalance(recipient.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("2"));
      expect(await wallet.balanceOf()).to.equal(ethers.parseEther("3"));
    });

    it("Should revert if not owner", async function () {
      const { wallet, recipient, nonOwner } = await loadFixture(deployFixture);

      await wallet.connect(nonOwner).deposit({ value: ethers.parseEther("5") });

      await expect(
        wallet.connect(nonOwner).send(recipient.address, ethers.parseEther("1"))
      ).to.be.revertedWith("sender not allowed");
    });

    it("Should revert if insufficient balance", async function () {
      const { wallet, owner, recipient, nonOwner } = await loadFixture(
        deployFixture
      );

      await wallet.connect(nonOwner).deposit({ value: ethers.parseEther("1") });

      await expect(
        wallet.connect(owner).send(recipient.address, ethers.parseEther("5"))
      ).to.be.reverted;
    });
  });

  describe("balanceOf", function () {
    it("Should return correct balance", async function () {
      const { wallet, nonOwner } = await loadFixture(deployFixture);

      expect(await wallet.balanceOf()).to.equal(0);

      await wallet.connect(nonOwner).deposit({ value: ethers.parseEther("1") });
      expect(await wallet.balanceOf()).to.equal(ethers.parseEther("1"));
    });
  });
});
