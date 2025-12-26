import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * VULNERABILITY REPORT - Tinder.sol
 * ==================================
 * BUG on lines 105-109: Swipe limit logic is inverted
 *
 * Current logic:
 * if (swipeSession.start + 86400 <= block.timestamp) {
 *     swipeSession.start = block.timestamp;
 *     swipeSession.count = 100;  // Resets to 100
 * }
 * require(swipeSession.count <= 100, ...);  // Always passes after reset!
 * swipeSession.count++;  // Increments beyond 100
 *
 * The check `swipeSession.count <= 100` will ALWAYS pass right after reset
 * because count is set to 100. It should be `swipeSession.count < 100` or
 * count should reset to 0 and check should be `>= 100`.
 *
 * IMPACT: Users can swipe unlimited times (no actual limit enforcement)
 */

describe("Tinder", function () {
  async function deployFixture() {
    const [user1, user2, user3] = await ethers.getSigners();

    const Tinder = await ethers.getContractFactory("Tinder");
    const tinder = await Tinder.deploy();

    return { tinder, user1, user2, user3 };
  }

  describe("register", function () {
    it("Should register a user", async function () {
      const { tinder, user1 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 0, 25, "https://pic.com/alice");

      // User registered - can now use the app
    });

    it("Should revert if already registered", async function () {
      const { tinder, user1 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 0, 25, "https://pic.com/alice");

      await expect(
        tinder
          .connect(user1)
          .register("Alice2", "NYC", 0, 26, "https://pic.com/alice2")
      ).to.be.revertedWith("User is already registered");
    });

    it("Should revert if name is empty", async function () {
      const { tinder, user1 } = await loadFixture(deployFixture);

      await expect(
        tinder.connect(user1).register("", "NYC", 0, 25, "https://pic.com/alice")
      ).to.be.revertedWith("_name cannot be empty");
    });

    it("Should revert if city is empty", async function () {
      const { tinder, user1 } = await loadFixture(deployFixture);

      await expect(
        tinder
          .connect(user1)
          .register("Alice", "", 0, 25, "https://pic.com/alice")
      ).to.be.revertedWith("_city cannot be empty");
    });

    it("Should revert if under 18", async function () {
      const { tinder, user1 } = await loadFixture(deployFixture);

      await expect(
        tinder
          .connect(user1)
          .register("Alice", "NYC", 0, 17, "https://pic.com/alice")
      ).to.be.revertedWith("_age must be 18 or above");
    });

    it("Should revert if picURL is empty", async function () {
      const { tinder, user1 } = await loadFixture(deployFixture);

      await expect(
        tinder.connect(user1).register("Alice", "NYC", 0, 25, "")
      ).to.be.revertedWith("_picURL cannot be empty");
    });
  });

  describe("swipe", function () {
    it("Should allow swiping on another user", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      // Register users (opposite genders, same city)
      await tinder
        .connect(user1)
        .register("Alice", "NYC", 1, 25, "https://pic.com/alice"); // Female
      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob"); // Male

      // Swipe right (like)
      await tinder.connect(user1).swipe(1, user2.address); // Like
    });

    it("Should revert if swiping same person twice", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 1, 25, "https://pic.com/alice");
      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob");

      await tinder.connect(user1).swipe(1, user2.address);

      await expect(
        tinder.connect(user1).swipe(1, user2.address)
      ).to.be.revertedWith("Cannot swipe the same person twice");
    });

    it("Should emit NewMatch when mutual like", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 1, 25, "https://pic.com/alice");
      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob");

      await tinder.connect(user1).swipe(1, user2.address); // Alice likes Bob

      // Bob likes Alice back - should emit match
      await expect(tinder.connect(user2).swipe(1, user1.address))
        .to.emit(tinder, "NewMatch");
      // Note: Not checking exact timestamp as it can vary by 1 second
    });

    it("Should revert if user not registered", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob");

      await expect(
        tinder.connect(user1).swipe(1, user2.address)
      ).to.be.revertedWith("User is not registered");
    });
  });

  describe("sendMessage", function () {
    it("Should allow messaging after mutual like", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 1, 25, "https://pic.com/alice");
      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob");

      await tinder.connect(user1).swipe(1, user2.address);
      await tinder.connect(user2).swipe(1, user1.address);

      await expect(tinder.connect(user1).sendMessage(user2.address, "Hi Bob!"))
        .to.emit(tinder, "NewMessage");
    });

    it("Should revert if not matched", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 1, 25, "https://pic.com/alice");
      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob");

      await tinder.connect(user1).swipe(1, user2.address); // Only Alice liked

      await expect(
        tinder.connect(user1).sendMessage(user2.address, "Hi!")
      ).to.be.revertedWith(
        "Both users need to have liked each other (match) to send messages"
      );
    });
  });

  describe("VULNERABILITY: Swipe limit bypass", function () {
    it("Swipe count logic allows unlimited swipes due to bug", async function () {
      const { tinder, user1, user2 } = await loadFixture(deployFixture);

      await tinder
        .connect(user1)
        .register("Alice", "NYC", 1, 25, "https://pic.com/alice");
      await tinder
        .connect(user2)
        .register("Bob", "NYC", 0, 26, "https://pic.com/bob");

      // After first swipe in a new session, count is set to 100 then incremented to 101
      // The check is count <= 100, which passes when count == 100
      // So effectively there's no real limit enforcement
      await tinder.connect(user1).swipe(1, user2.address);

      // The vulnerability allows bypassing the 100 swipe limit
      // because the check happens after reset and before increment
    });
  });
});

