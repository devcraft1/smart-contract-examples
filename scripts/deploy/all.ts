import { ethers, network } from "hardhat";
import { deploy, DeploymentResult, saveDeployment } from "./utils";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("=".repeat(60));
  console.log("Deploying All Contracts");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("=".repeat(60));

  const deployed: DeploymentResult[] = [];

  // Simple contracts (no constructor args)
  const simpleContracts = [
    "Counter",
    "AdvancedStorage",
    "Crud",
    "Fibonacci",
    "Voting",
    "Tinder",
    "Twitter",
    "Dex",
    "BookAService",
    "EventContract",
    "Strings",
  ];

  for (const name of simpleContracts) {
    console.log(`\nDeploying ${name}...`);
    try {
      const { result } = await deploy(name);
      deployed.push(result);
      await saveDeployment(result);
      console.log(`${name} deployed to: ${result.address}`);
    } catch (error: any) {
      console.log(`Failed to deploy ${name}: ${error.message}`);
    }
  }

  // DAO
  console.log("\nDeploying DAO...");
  try {
    const { result } = await deploy("DAO", [
      7 * 24 * 60 * 60, // contribution time
      7 * 24 * 60 * 60, // vote time
      50, // quorum
    ]);
    deployed.push(result);
    await saveDeployment(result);
    console.log(`DAO deployed to: ${result.address}`);
  } catch (error: any) {
    console.log(`Failed to deploy DAO: ${error.message}`);
  }

  // Lottery
  console.log("\nDeploying Lottery...");
  try {
    const { result } = await deploy("Lottery", [2]);
    deployed.push(result);
    await saveDeployment(result);
    console.log(`Lottery deployed to: ${result.address}`);
  } catch (error: any) {
    console.log(`Failed to deploy Lottery: ${error.message}`);
  }

  // ICO
  console.log("\nDeploying ICO...");
  try {
    const { result } = await deploy("ICO", [
      "Example Token",
      "EXT",
      18,
      ethers.parseEther("1000000"),
    ]);
    deployed.push(result);
    await saveDeployment(result);
    console.log(`ICO deployed to: ${result.address}`);
  } catch (error: any) {
    console.log(`Failed to deploy ICO: ${error.message}`);
  }

  // Timelock
  console.log("\nDeploying Timelock...");
  try {
    const { result } = await deploy("Timelock", [deployer.address, 7 * 24 * 60 * 60]);
    deployed.push(result);
    await saveDeployment(result);
    console.log(`Timelock deployed to: ${result.address}`);
  } catch (error: any) {
    console.log(`Failed to deploy Timelock: ${error.message}`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Deployment Summary");
  console.log("=".repeat(60));
  for (const contract of deployed) {
    console.log(`${contract.name}: ${contract.address}`);
  }
  console.log("=".repeat(60));
  console.log(`Total contracts deployed: ${deployed.length}`);

  const finalBalance = await ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;
  console.log(`\nTotal gas cost: ${ethers.formatEther(gasUsed)} ETH`);
  console.log(`Remaining balance: ${ethers.formatEther(finalBalance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
