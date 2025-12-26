import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Strings", function () {
  async function deployFixture() {
    const Strings = await ethers.getContractFactory("Strings");
    const strings = await Strings.deploy();
    return { strings };
  }

  describe("length", function () {
    it("Should return correct length for regular string", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.length("hello")).to.equal(5);
    });

    it("Should return 0 for empty string", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.length("")).to.equal(0);
    });

    it("Should return correct length for string with spaces", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.length("hello world")).to.equal(11);
    });

    it("Should return correct length for single character", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.length("a")).to.equal(1);
    });
  });

  describe("concatenate", function () {
    it("Should concatenate two strings", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.concatenate("hello", "world")).to.equal("helloworld");
    });

    it("Should handle empty first string", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.concatenate("", "world")).to.equal("world");
    });

    it("Should handle empty second string", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.concatenate("hello", "")).to.equal("hello");
    });

    it("Should handle both empty strings", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.concatenate("", "")).to.equal("");
    });

    it("Should concatenate strings with spaces", async function () {
      const { strings } = await loadFixture(deployFixture);
      expect(await strings.concatenate("hello ", "world")).to.equal(
        "hello world"
      );
    });
  });
});
