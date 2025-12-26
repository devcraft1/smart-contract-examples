import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AdvancedStorage", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const AdvancedStorage = await ethers.getContractFactory("AdvancedStorage");
    const storage = await AdvancedStorage.deploy();
    return { storage, owner, otherAccount };
  }

  describe("add", function () {
    it("Should add an id to the array", async function () {
      const { storage } = await loadFixture(deployFixture);
      await storage.add(42);
      expect(await storage.get(0)).to.equal(42);
    });

    it("Should add multiple ids", async function () {
      const { storage } = await loadFixture(deployFixture);
      await storage.add(1);
      await storage.add(2);
      await storage.add(3);
      expect(await storage.getLength()).to.equal(3);
    });
  });

  describe("get", function () {
    it("Should return the correct id at position", async function () {
      const { storage } = await loadFixture(deployFixture);
      await storage.add(100);
      await storage.add(200);
      expect(await storage.get(1)).to.equal(200);
    });

    it("Should revert for invalid position", async function () {
      const { storage } = await loadFixture(deployFixture);
      await expect(storage.get(0)).to.be.reverted;
    });
  });

  describe("getAll", function () {
    it("Should return all ids", async function () {
      const { storage } = await loadFixture(deployFixture);
      await storage.add(1);
      await storage.add(2);
      await storage.add(3);
      const all = await storage.getAll();
      expect(all.length).to.equal(3);
      expect(all[0]).to.equal(1);
      expect(all[1]).to.equal(2);
      expect(all[2]).to.equal(3);
    });

    it("Should return empty array when no ids", async function () {
      const { storage } = await loadFixture(deployFixture);
      const all = await storage.getAll();
      expect(all.length).to.equal(0);
    });
  });

  describe("getLength", function () {
    it("Should return correct length", async function () {
      const { storage } = await loadFixture(deployFixture);
      expect(await storage.getLength()).to.equal(0);
      await storage.add(1);
      expect(await storage.getLength()).to.equal(1);
    });
  });
});
