import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Escrow", function () {
  async function deployFixture() {
    const [lawyer, payer, payee] = await ethers.getSigners();
    const amount = ethers.parseEther("1");

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.connect(lawyer).deploy(
      payer.address,
      payee.address,
      amount
    );

    return { escrow, lawyer, payer, payee, amount };
  }

  describe("Deployment", function () {
    it("Should set correct parties", async function () {
      const { escrow, lawyer, payer, payee, amount } = await loadFixture(
        deployFixture
      );
      expect(await escrow.lawyer()).to.equal(lawyer.address);
      expect(await escrow.payer()).to.equal(payer.address);
      expect(await escrow.payee()).to.equal(payee.address);
      expect(await escrow.amount()).to.equal(amount);
    });
  });

  describe("deposit", function () {
    it("Should allow payer to deposit", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      await escrow.connect(payer).deposit({ value: ethers.parseEther("0.5") });
      expect(await escrow.balanceOf()).to.equal(ethers.parseEther("0.5"));
    });

    it("Should revert if not payer", async function () {
      const { escrow, lawyer } = await loadFixture(deployFixture);
      await expect(
        escrow.connect(lawyer).deposit({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Sender must be the payer");
    });

    it("Should revert if exceeds escrow amount", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      await expect(
        escrow.connect(payer).deposit({ value: ethers.parseEther("2") })
      ).to.be.revertedWith("Cant send more than escrow amount");
    });
  });

  describe("release", function () {
    it("Should allow lawyer to release when full amount deposited", async function () {
      const { escrow, lawyer, payer, payee, amount } = await loadFixture(
        deployFixture
      );
      await escrow.connect(payer).deposit({ value: amount });

      const balanceBefore = await ethers.provider.getBalance(payee.address);
      await escrow.connect(lawyer).release();
      const balanceAfter = await ethers.provider.getBalance(payee.address);

      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("Should revert if not lawyer", async function () {
      const { escrow, payer, amount } = await loadFixture(deployFixture);
      await escrow.connect(payer).deposit({ value: amount });
      await expect(escrow.connect(payer).release()).to.be.revertedWith(
        "only lawyer can release funds"
      );
    });

    it("Should revert if not full amount", async function () {
      const { escrow, lawyer, payer } = await loadFixture(deployFixture);
      await escrow.connect(payer).deposit({ value: ethers.parseEther("0.5") });
      await expect(escrow.connect(lawyer).release()).to.be.revertedWith(
        "cannot release funds before full amount is sent"
      );
    });
  });
});
