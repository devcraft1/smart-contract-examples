import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment, getDeployerInfo } from "./utils";
import { ethers } from "hardhat";

async function main() {
  printHeader("Wallet (MultiSignature)");
  await printDeployerInfo();

  const { deployer } = await getDeployerInfo();

  // Constructor args: approvers[], quorum
  // For demo, using deployer - update for production
  const approvers = [deployer.address];
  const quorum = 1;

  console.log("\nNote: Update approvers and quorum for production deployment");

  const factory = await ethers.getContractFactory("contracts/MultiSignature.sol:Wallet");
  const contract = await factory.deploy(approvers, quorum);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const result = {
    name: "Wallet",
    address,
    constructorArgs: [approvers, quorum],
  };

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
