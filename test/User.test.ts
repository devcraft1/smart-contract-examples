import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

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

  describe("UserName", function () {
    it("Should return name for first user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserName(1)).to.equal("Alice");
    });

    it("Should return name for any user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      await test.createUser(2, "Bob", "Rust");

      expect(await test.UserName(1)).to.equal("Alice");
      expect(await test.UserName(2)).to.equal("Bob");
    });

    it("Should return 'not found' for non-existent user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserName(999)).to.equal("username not found");
    });
  });

  describe("UserInterest", function () {
    it("Should return interest for first user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserInterest(1)).to.equal("Solidity");
    });

    it("Should return interest for any user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      await test.createUser(2, "Bob", "Rust");

      expect(await test.UserInterest(1)).to.equal("Solidity");
      expect(await test.UserInterest(2)).to.equal("Rust");
    });

    it("Should return 'not found' for non-existent user", async function () {
      const { test } = await loadFixture(deployFixture);
      await test.createUser(1, "Alice", "Solidity");
      expect(await test.UserInterest(999)).to.equal("user interest not found");
    });
  });
});
