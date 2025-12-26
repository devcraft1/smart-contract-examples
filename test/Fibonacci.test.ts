import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Fibonacci", function () {
  async function deployFixture() {
    const Fibonacci = await ethers.getContractFactory("Fibonacci");
    const fibonacci = await Fibonacci.deploy();
    return { fibonacci };
  }

  describe("fib", function () {
    it("Should return 0 for n=0", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(0)).to.equal(0);
    });

    it("Should return 1 for n=1", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(1)).to.equal(1);
    });

    it("Should return 1 for n=2", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(2)).to.equal(1);
    });

    it("Should return 2 for n=3", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(3)).to.equal(2);
    });

    it("Should return 5 for n=5", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(5)).to.equal(5);
    });

    it("Should return 55 for n=10", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(10)).to.equal(55);
    });

    it("Should return 6765 for n=20", async function () {
      const { fibonacci } = await loadFixture(deployFixture);
      expect(await fibonacci.fib(20)).to.equal(6765);
    });
  });
});
