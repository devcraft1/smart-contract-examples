import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - Tweet.sol (Twitter contract)
 * ====================================================
 * 1. Missing operator authorization mechanism:
 *    The canOperate modifier requires operators[_from][msg.sender] == true
 *    But there's no function to set operators!
 *    This means no one can tweet or send messages (except if operators mapping
 *    is somehow initialized, which it's not).
 *
 * 2. _sendMessage function is commented out (lines 137-142):
 *    The message sending functionality is disabled.
 *
 * IMPACT: Contract is non-functional - no one can tweet or message
 */

describe("Twitter", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Twitter = await ethers.getContractFactory("Twitter");
    const twitter = await Twitter.deploy();

    return { twitter, owner, user1, user2 };
  }

  describe("VULNERABILITY: No way to authorize operators", function () {
    it("tweet() should revert because no one is authorized", async function () {
      const { twitter, user1 } = await loadFixture(deployFixture);

      // There's no function to authorize operators
      // So canOperate modifier will always fail
      await expect(
        twitter.connect(user1).tweet("Hello World!")
      ).to.be.revertedWith("Operator not authorized");
    });

    it("tweetFrom() should revert because no one is authorized", async function () {
      const { twitter, user1, user2 } = await loadFixture(deployFixture);

      await expect(
        twitter.connect(user1).tweetFrom(user2.address, "Hello!")
      ).to.be.revertedWith("Operator not authorized");
    });

    it("sendMessage() should revert because no one is authorized", async function () {
      const { twitter, user1, user2 } = await loadFixture(deployFixture);

      await expect(
        twitter.connect(user1).sendMessage("Hello!", user2.address)
      ).to.be.revertedWith("Operator not authorized");
    });

    it("sendMessageFrom() should revert because no one is authorized", async function () {
      const { twitter, owner, user1, user2 } = await loadFixture(deployFixture);

      await expect(
        twitter
          .connect(owner)
          .sendMessageFrom("Hello!", user1.address, user2.address)
      ).to.be.revertedWith("Operator not authorized");
    });
  });

  describe("getLatestTweets", function () {
    it("Should revert if no tweets exist", async function () {
      const { twitter } = await loadFixture(deployFixture);

      await expect(twitter.getLatestTweets(1)).to.be.revertedWith(
        "Too few or too many tweets to return"
      );
    });

    it("Should revert if requesting 0 tweets", async function () {
      const { twitter } = await loadFixture(deployFixture);

      await expect(twitter.getLatestTweets(0)).to.be.revertedWith(
        "Too few or too many tweets to return"
      );
    });
  });

  describe("getTweetsOf", function () {
    it("Should revert if user has no tweets", async function () {
      const { twitter, user1 } = await loadFixture(deployFixture);

      await expect(twitter.getTweetsOf(user1.address, 1)).to.be.revertedWith(
        "Too few or too many tweets to return"
      );
    });
  });

  describe("follow", function () {
    it("Should allow following users (no authorization needed)", async function () {
      const { twitter, user1, user2 } = await loadFixture(deployFixture);

      // follow() doesn't use canOperate, so it works
      await twitter.connect(user1).follow(user2.address);
      // Following successful (no way to verify without getter)
    });
  });
});
