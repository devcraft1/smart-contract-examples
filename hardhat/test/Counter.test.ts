import { expect } from "chai";
import { ethers } from "hardhat";
import { Counter } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Counter", function () {
  async function deployCounterFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();

    return { counter, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the initial number to 0", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      expect(await counter.number()).to.equal(0);
    });
  });

  describe("setNumber", function () {
    it("Should set the number correctly", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      await counter.setNumber(42);
      expect(await counter.number()).to.equal(42);
    });
  });

  describe("increment", function () {
    it("Should increment the number by 1", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      await counter.setNumber(5);
      await counter.increment();
      expect(await counter.number()).to.equal(6);
    });
  });

  describe("decrement", function () {
    it("Should decrement the number by 1", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      await counter.setNumber(5);
      await counter.decrement();
      expect(await counter.number()).to.equal(4);
    });
  });
});