import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - Vault.sol
 * =================================
 * POTENTIAL ISSUE on line 34:
 * Division by token.balanceOf(address(this)) could cause division by zero
 * if the vault's token balance is 0 but totalSupply > 0.
 *
 * This could happen if:
 * 1. Users deposit tokens
 * 2. All tokens are somehow removed (e.g., via a separate yield mechanism)
 * 3. New user tries to deposit
 *
 * Similarly, line 42-43 in withdraw could have precision issues.
 *
 * ALSO: No reentrancy protection - state changes should happen before external calls
 */

describe("Vault", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000")
    );

    // Deploy vault
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(await token.getAddress());

    // Transfer tokens to users
    await token.transfer(user1.address, ethers.parseEther("1000"));
    await token.transfer(user2.address, ethers.parseEther("1000"));

    return { vault, token, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set token correctly", async function () {
      const { vault, token } = await loadFixture(deployFixture);
      expect(await vault.token()).to.equal(await token.getAddress());
    });

    it("Should have zero total supply initially", async function () {
      const { vault } = await loadFixture(deployFixture);
      expect(await vault.totalSupply()).to.equal(0);
    });
  });

  describe("deposit", function () {
    it("Should mint shares equal to deposit on first deposit", async function () {
      const { vault, token, user1 } = await loadFixture(deployFixture);

      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      expect(await vault.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("100"));
    });

    it("Should mint proportional shares on subsequent deposits", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployFixture);

      // User1 deposits 100
      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // User2 deposits 100 (should get equal shares)
      await token.connect(user2).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user2).deposit(ethers.parseEther("100"));

      expect(await vault.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("withdraw", function () {
    it("Should burn shares and return tokens", async function () {
      const { vault, token, user1 } = await loadFixture(deployFixture);

      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      const balanceBefore = await token.balanceOf(user1.address);
      await vault.connect(user1).withdraw(ethers.parseEther("50"));
      const balanceAfter = await token.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("50"));
      expect(await vault.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should return proportional tokens when vault has yield", async function () {
      const { vault, token, user1, owner } = await loadFixture(deployFixture);

      // User1 deposits 100
      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // Simulate yield: send 100 more tokens to vault
      await token.transfer(await vault.getAddress(), ethers.parseEther("100"));

      // User1 withdraws all shares - should get 200 tokens (100 deposit + 100 yield)
      const balanceBefore = await token.balanceOf(user1.address);
      await vault.connect(user1).withdraw(ethers.parseEther("100"));
      const balanceAfter = await token.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("200"));
    });

    it("Should revert if insufficient shares", async function () {
      const { vault, token, user1 } = await loadFixture(deployFixture);

      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      await expect(
        vault.connect(user1).withdraw(ethers.parseEther("200"))
      ).to.be.reverted; // Underflow in balanceOf
    });
  });

  describe("VULNERABILITY: Division by zero potential", function () {
    it("Demonstrates the risk of token balance being 0", async function () {
      const { vault, token, user1 } = await loadFixture(deployFixture);

      // User deposits
      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // If somehow all tokens were drained from vault
      // and another user tried to deposit, there would be division by zero
      // This test documents the vulnerability
      expect(await vault.totalSupply()).to.be.gt(0);
    });
  });
});
