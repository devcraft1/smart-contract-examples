import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("Staking", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy staking token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const stakingToken = await MockERC20.deploy(
      "Staking Token",
      "STK",
      ethers.parseEther("1000000")
    );

    // Deploy rewards token
    const rewardsToken = await MockERC20.deploy(
      "Rewards Token",
      "RWD",
      ethers.parseEther("1000000")
    );

    // Deploy staking contract
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(
      await stakingToken.getAddress(),
      await rewardsToken.getAddress()
    );

    // Transfer tokens to users
    await stakingToken.transfer(user1.address, ethers.parseEther("1000"));
    await stakingToken.transfer(user2.address, ethers.parseEther("1000"));

    // Transfer reward tokens to staking contract
    await rewardsToken.transfer(await staking.getAddress(), ethers.parseEther("100000"));

    return { staking, stakingToken, rewardsToken, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set tokens correctly", async function () {
      const { staking, stakingToken, rewardsToken } = await loadFixture(
        deployFixture
      );
      expect(await staking.stakingToken()).to.equal(
        await stakingToken.getAddress()
      );
      expect(await staking.rewardsToken()).to.equal(
        await rewardsToken.getAddress()
      );
    });

    it("Should have zero total supply initially", async function () {
      const { staking } = await loadFixture(deployFixture);
      expect(await staking._totalSupply()).to.equal(0);
    });
  });

  describe("stake", function () {
    it("Should stake tokens", async function () {
      const { staking, stakingToken, user1 } = await loadFixture(deployFixture);

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      expect(await staking._totalSupply()).to.equal(ethers.parseEther("100"));
    });

    it("Should allow multiple users to stake", async function () {
      const { staking, stakingToken, user1, user2 } = await loadFixture(
        deployFixture
      );

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      await stakingToken
        .connect(user2)
        .approve(await staking.getAddress(), ethers.parseEther("200"));
      await staking.connect(user2).stake(ethers.parseEther("200"));

      expect(await staking._totalSupply()).to.equal(ethers.parseEther("300"));
    });
  });

  describe("withdraw", function () {
    it("Should withdraw staked tokens", async function () {
      const { staking, stakingToken, user1 } = await loadFixture(deployFixture);

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      const balanceBefore = await stakingToken.balanceOf(user1.address);
      await staking.connect(user1).withdraw(ethers.parseEther("50"));
      const balanceAfter = await stakingToken.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("50"));
      expect(await staking._totalSupply()).to.equal(ethers.parseEther("50"));
    });

    it("Should revert if withdrawing more than staked", async function () {
      const { staking, stakingToken, user1 } = await loadFixture(deployFixture);

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      await expect(
        staking.connect(user1).withdraw(ethers.parseEther("200"))
      ).to.be.reverted;
    });
  });

  describe("earned and getReward", function () {
    it("Should earn rewards over time", async function () {
      const { staking, stakingToken, user1 } = await loadFixture(deployFixture);

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      // Fast forward time
      await time.increase(100);

      const earned = await staking.earned(user1.address);
      expect(earned).to.be.gt(0);
    });

    it("Should claim rewards", async function () {
      const { staking, stakingToken, rewardsToken, user1 } = await loadFixture(
        deployFixture
      );

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      await time.increase(100);

      const rewardsBefore = await rewardsToken.balanceOf(user1.address);
      await staking.connect(user1).getReward();
      const rewardsAfter = await rewardsToken.balanceOf(user1.address);

      expect(rewardsAfter).to.be.gt(rewardsBefore);
    });
  });

  describe("rewardPerToken", function () {
    it("Should return stored value when total supply is 0", async function () {
      const { staking } = await loadFixture(deployFixture);
      expect(await staking.rewardPerToken()).to.equal(0);
    });

    it("Should increase over time when tokens are staked", async function () {
      const { staking, stakingToken, user1 } = await loadFixture(deployFixture);

      await stakingToken
        .connect(user1)
        .approve(await staking.getAddress(), ethers.parseEther("100"));
      await staking.connect(user1).stake(ethers.parseEther("100"));

      const rewardPerToken1 = await staking.rewardPerToken();
      await time.increase(100);
      const rewardPerToken2 = await staking.rewardPerToken();

      expect(rewardPerToken2).to.be.gt(rewardPerToken1);
    });
  });
});
