import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - User.sol (Test contract)
 * ================================================
 * BUG in UserName() and UserInterest() functions (lines 35, 44):
 * The "not found" return statement is INSIDE the for loop, executing on first iteration
 * if the condition doesn't match.
 *
 * Current logic:
 * for (i = 0; i < user.length; i++) {
 *     if (user[i].id == id) { return user[i].name; }
 *     return "username not found";  // BUG: Returns on first non-match!
 * }
 *
 * Should be:
 * for (i = 0; i < user.length; i++) {
 *     if (user[i].id == id) { return user[i].name; }
 * }
 * return "username not found";  // After loop completes
 *
 * IMPACT: Can only find user with id at index 0
 */

describe("Test (User)", function () {
  async function deployFixture() {
    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy();
    return { test };
  }

  describe("createUser", function () {
    it("Should create a user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserId(1)).to.equal(1);
    });

    it("Should create multiple users", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      await test.createUser(2, "Bob", "Rust");
      expect(await test.UserId(1)).to.equal(1);
      expect(await test.UserId(2)).to.equal(2);
    });
  });

  describe("UserId", function () {
    it("Should return user id", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(42, "Alice", "Solidity");
      expect(await test.UserId(42)).to.equal(42);
    });

    it("Should revert for non-existent user", async function () {
      const { test } = await loadFixture(deployFixture);
      await expect(test.UserId(999)).to.be.revertedWith("user id not found");
    });
  });

  describe("UserName - VULNERABILITY TEST", function () {
    it("Should return name for first user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserName(1)).to.equal("Alice");
    });

    it("VULNERABILITY: Returns 'not found' for second user due to bug", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      await test.createUser(2, "Bob", "Rust");

      // First user works (index 0)
      expect(await test.UserName(1)).to.equal("Alice");

      // BUG: Second user returns "username not found" because
      // the return statement is inside the loop
      // On first iteration: id=2 != user[0].id=1, so returns "not found"
      expect(await test.UserName(2)).to.equal("username not found");
    });
  });

  describe("UserInterest - VULNERABILITY TEST", function () {
    it("Should return interest for first user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserInterest(1)).to.equal("Solidity");
    });

    it("VULNERABILITY: Returns 'not found' for second user due to bug", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      await test.createUser(2, "Bob", "Rust");

      // First user works
      expect(await test.UserInterest(1)).to.equal("Solidity");

      // BUG: Same issue as UserName
      expect(await test.UserInterest(2)).to.equal("user interest not found");
    });
  });
});
