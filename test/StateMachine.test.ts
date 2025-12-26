import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("StateMachine (Loan)", function () {
  async function deployFixture() {
    const [deployer, borrower, lender] = await ethers.getSigners();
    const amount = ethers.parseEther("1");
    const interest = ethers.parseEther("0.1");
    const duration = 86400; // 1 day

    const StateMachine = await ethers.getContractFactory("StateMachine");
    const loan = await StateMachine.deploy(
      amount,
      interest,
      duration,
      borrower.address,
      lender.address
    );

    return { loan, deployer, borrower, lender, amount, interest, duration };
  }

  describe("Deployment", function () {
    it("Should set initial state to PENDING", async function () {
      const { loan } = await loadFixture(deployFixture);
      expect(await loan.state()).to.equal(0); // PENDING = 0
    });

    it("Should set loan parameters correctly", async function () {
      const { loan, borrower, lender, amount, interest, duration } =
        await loadFixture(deployFixture);
      expect(await loan.amount()).to.equal(amount);
      expect(await loan.interest()).to.equal(interest);
      expect(await loan.duration()).to.equal(duration);
      expect(await loan.borrower()).to.equal(borrower.address);
      expect(await loan.lender()).to.equal(lender.address);
    });
  });

  describe("fund", function () {
    it("Should allow lender to fund the loan", async function () {
      const { loan, lender, borrower, amount } = await loadFixture(
        deployFixture
      );

      const balanceBefore = await ethers.provider.getBalance(borrower.address);
      await loan.connect(lender).fund({ value: amount });
      const balanceAfter = await ethers.provider.getBalance(borrower.address);

      expect(await loan.state()).to.equal(1); // ACTIVE = 1
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("Should revert if not lender", async function () {
      const { loan, borrower, amount } = await loadFixture(deployFixture);
      await expect(
        loan.connect(borrower).fund({ value: amount })
      ).to.be.revertedWith("only lender can lend");
    });

    it("Should revert if wrong amount", async function () {
      const { loan, lender } = await loadFixture(deployFixture);
      await expect(
        loan.connect(lender).fund({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("can only lend the exact amount");
    });
  });

  describe("reimburse", function () {
    it("Should allow borrower to reimburse after maturity", async function () {
      const { loan, lender, borrower, amount, interest, duration } =
        await loadFixture(deployFixture);

      await loan.connect(lender).fund({ value: amount });
      await time.increase(duration + 1);

      const totalRepayment = amount + interest;
      const lenderBalanceBefore = await ethers.provider.getBalance(
        lender.address
      );
      await loan.connect(borrower).reimburse({ value: totalRepayment });
      const lenderBalanceAfter = await ethers.provider.getBalance(
        lender.address
      );

      expect(await loan.state()).to.equal(2); // CLOSED = 2
      expect(lenderBalanceAfter - lenderBalanceBefore).to.equal(totalRepayment);
    });

    it("Should revert if not borrower", async function () {
      const { loan, lender, amount, interest, duration } = await loadFixture(
        deployFixture
      );
      await loan.connect(lender).fund({ value: amount });
      await time.increase(duration + 1);

      await expect(
        loan.connect(lender).reimburse({ value: amount + interest })
      ).to.be.revertedWith("only borrower can reimburse");
    });

    it("Should revert if loan not matured", async function () {
      const { loan, lender, borrower, amount, interest } = await loadFixture(
        deployFixture
      );
      await loan.connect(lender).fund({ value: amount });

      await expect(
        loan.connect(borrower).reimburse({ value: amount + interest })
      ).to.be.revertedWith("loan hasnt matured yet");
    });

    it("Should revert if wrong repayment amount", async function () {
      const { loan, lender, borrower, amount, duration } = await loadFixture(
        deployFixture
      );
      await loan.connect(lender).fund({ value: amount });
      await time.increase(duration + 1);

      await expect(
        loan.connect(borrower).reimburse({ value: amount })
      ).to.be.revertedWith("borrower need to reimburse exactly amount + interest");
    });
  });
});
