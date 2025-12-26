import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("EventContract", function () {
  async function deployFixture() {
    const [admin, buyer1, buyer2] = await ethers.getSigners();
    const EventContract = await ethers.getContractFactory("EventContract");
    const eventContract = await EventContract.deploy();
    return { eventContract, admin, buyer1, buyer2 };
  }

  describe("createEvent", function () {
    it("Should create an event", async function () {
      const { eventContract, admin } = await loadFixture(deployFixture);
      const futureDate = (await time.latest()) + 86400; // 1 day from now
      await eventContract
        .connect(admin)
        .createEvent("Concert", futureDate, ethers.parseEther("0.1"), 100);

      const event = await eventContract.events(0);
      expect(event.name).to.equal("Concert");
      expect(event.ticketCount).to.equal(100);
    });

    it("Should revert if date is in past", async function () {
      const { eventContract } = await loadFixture(deployFixture);
      const pastDate = (await time.latest()) - 1;
      await expect(
        eventContract.createEvent("Concert", pastDate, ethers.parseEther("0.1"), 100)
      ).to.be.revertedWith("can only organize event at a future date");
    });

    it("Should revert if ticket count is 0", async function () {
      const { eventContract } = await loadFixture(deployFixture);
      const futureDate = (await time.latest()) + 86400;
      await expect(
        eventContract.createEvent("Concert", futureDate, ethers.parseEther("0.1"), 0)
      ).to.be.revertedWith("can only organize event with at least 1 ticket");
    });
  });

  describe("buyTicket", function () {
    it("Should allow buying tickets", async function () {
      const { eventContract, admin, buyer1 } = await loadFixture(deployFixture);
      const futureDate = (await time.latest()) + 86400;
      await eventContract
        .connect(admin)
        .createEvent("Concert", futureDate, ethers.parseEther("0.1"), 100);

      await eventContract
        .connect(buyer1)
        .buyTicket(0, 2, { value: ethers.parseEther("0.2") });

      expect(await eventContract.tickets(buyer1.address, 0)).to.equal(2);
    });

    it("Should revert if wrong payment amount", async function () {
      const { eventContract, admin, buyer1 } = await loadFixture(deployFixture);
      const futureDate = (await time.latest()) + 86400;
      await eventContract
        .connect(admin)
        .createEvent("Concert", futureDate, ethers.parseEther("0.1"), 100);

      await expect(
        eventContract
          .connect(buyer1)
          .buyTicket(0, 2, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("ether sent must be equal to total ticket cost");
    });

    it("Should revert if not enough tickets", async function () {
      const { eventContract, admin, buyer1 } = await loadFixture(deployFixture);
      const futureDate = (await time.latest()) + 86400;
      await eventContract
        .connect(admin)
        .createEvent("Concert", futureDate, ethers.parseEther("0.1"), 2);

      await expect(
        eventContract
          .connect(buyer1)
          .buyTicket(0, 5, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("not enough ticket left");
    });
  });

  describe("transferTicket", function () {
    it("Should transfer tickets", async function () {
      const { eventContract, admin, buyer1, buyer2 } = await loadFixture(
        deployFixture
      );
      const futureDate = (await time.latest()) + 86400;
      await eventContract
        .connect(admin)
        .createEvent("Concert", futureDate, ethers.parseEther("0.1"), 100);

      await eventContract
        .connect(buyer1)
        .buyTicket(0, 5, { value: ethers.parseEther("0.5") });

      await eventContract.connect(buyer1).transferTicket(0, 2, buyer2.address);

      expect(await eventContract.tickets(buyer1.address, 0)).to.equal(3);
      expect(await eventContract.tickets(buyer2.address, 0)).to.equal(2);
    });

    it("Should revert if not enough tickets", async function () {
      const { eventContract, admin, buyer1, buyer2 } = await loadFixture(
        deployFixture
      );
      const futureDate = (await time.latest()) + 86400;
      await eventContract
        .connect(admin)
        .createEvent("Concert", futureDate, ethers.parseEther("0.1"), 100);

      await eventContract
        .connect(buyer1)
        .buyTicket(0, 2, { value: ethers.parseEther("0.2") });

      await expect(
        eventContract.connect(buyer1).transferTicket(0, 5, buyer2.address)
      ).to.be.revertedWith("not enough ticket");
    });
  });
});
