import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Crud", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();
    const Crud = await ethers.getContractFactory("Crud");
    const crud = await Crud.deploy();
    return { crud, owner };
  }

  describe("create", function () {
    it("Should create a new user", async function () {
      const { crud } = await loadFixture(deployFixture);
      await crud.create("Alice");
      const [id, name] = await crud.read(1);
      expect(id).to.equal(1);
      expect(name).to.equal("Alice");
    });

    it("Should increment id for each new user", async function () {
      const { crud } = await loadFixture(deployFixture);
      await crud.create("Alice");
      await crud.create("Bob");
      const [id1] = await crud.read(1);
      const [id2] = await crud.read(2);
      expect(id1).to.equal(1);
      expect(id2).to.equal(2);
    });
  });

  describe("read", function () {
    it("Should return user data", async function () {
      const { crud } = await loadFixture(deployFixture);
      await crud.create("Alice");
      const [id, name] = await crud.read(1);
      expect(id).to.equal(1);
      expect(name).to.equal("Alice");
    });

    it("Should revert for non-existent user", async function () {
      const { crud } = await loadFixture(deployFixture);
      await expect(crud.read(999)).to.be.revertedWith("User does not exist!");
    });
  });

  describe("update", function () {
    it("Should update user name", async function () {
      const { crud } = await loadFixture(deployFixture);
      await crud.create("Alice");
      await crud.update(1, "Alice Updated");
      const [, name] = await crud.read(1);
      expect(name).to.equal("Alice Updated");
    });

    it("Should revert for non-existent user", async function () {
      const { crud } = await loadFixture(deployFixture);
      await expect(crud.update(999, "Test")).to.be.revertedWith(
        "User does not exist!"
      );
    });
  });

  describe("destroy", function () {
    it("Should delete user (zeros the slot)", async function () {
      const { crud } = await loadFixture(deployFixture);
      await crud.create("Alice");
      await crud.destroy(1);
      // After delete in Solidity, the array slot is zeroed but not removed
      // The find() function can't find id=1 anymore because user[0].id is now 0
      // This is a known limitation of the delete operation in arrays
      await expect(crud.read(1)).to.be.revertedWith("User does not exist!");
    });

    it("Should revert for non-existent user", async function () {
      const { crud } = await loadFixture(deployFixture);
      await expect(crud.destroy(999)).to.be.revertedWith(
        "User does not exist!"
      );
    });
  });
});
