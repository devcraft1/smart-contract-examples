import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Schedules", function () {
  async function deployFixture() {
    const Schedules = await ethers.getContractFactory("Schedules");
    const schedules = await Schedules.deploy();
    return { schedules };
  }

  describe("State transitions", function () {
    it("Should default to work state", async function () {
      const { schedules } = await loadFixture(deployFixture);
      // Default enum value is 0 (work)
      expect(await schedules.checkState()).to.equal("at work");
    });

    it("Should set to home", async function () {
      const { schedules } = await loadFixture(deployFixture);
      await schedules.setToHome();
      expect(await schedules.checkState()).to.equal("at home");
    });

    it("Should set to field", async function () {
      const { schedules } = await loadFixture(deployFixture);
      await schedules.setToField();
      expect(await schedules.checkState()).to.equal("at field");
    });

    it("Should set to work", async function () {
      const { schedules } = await loadFixture(deployFixture);
      await schedules.setToHome();
      await schedules.setToWork();
      expect(await schedules.checkState()).to.equal("at work");
    });

    it("Should allow multiple state changes", async function () {
      const { schedules } = await loadFixture(deployFixture);
      await schedules.setToHome();
      expect(await schedules.checkState()).to.equal("at home");

      await schedules.setToField();
      expect(await schedules.checkState()).to.equal("at field");

      await schedules.setToWork();
      expect(await schedules.checkState()).to.equal("at work");
    });
  });
});
