import { ethers, network } from "hardhat";
import { BaseContract } from "ethers";

export interface DeploymentResult {
  name: string;
  address: string;
  constructorArgs: any[];
}

export async function getDeployerInfo() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  return { deployer, balance };
}

export function printHeader(contractName: string) {
  console.log("=".repeat(60));
  console.log(`Deploying ${contractName}`);
  console.log("=".repeat(60));
  console.log(`Network: ${network.name}`);
}

export async function printDeployerInfo() {
  const { deployer, balance } = await getDeployerInfo();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("=".repeat(60));
}

export function printDeploymentResult(result: DeploymentResult) {
  console.log(`\n${result.name} deployed to: ${result.address}`);
  if (result.constructorArgs.length > 0) {
    console.log(`Constructor args: ${JSON.stringify(result.constructorArgs)}`);
  }
  console.log("\nVerification command:");
  console.log(`npx hardhat verify --network ${network.name} ${result.address} ${result.constructorArgs.join(" ")}`);
}

export async function deploy<T extends BaseContract>(
  contractName: string,
  constructorArgs: any[] = []
): Promise<{ contract: T; result: DeploymentResult }> {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy(...constructorArgs) as T;
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const result: DeploymentResult = {
    name: contractName,
    address,
    constructorArgs,
  };

  return { contract, result };
}

export async function saveDeployment(result: DeploymentResult) {
  const fs = await import("fs");
  const path = await import("path");

  const deploymentsDir = path.join(__dirname, "../../deployments");
  const networkDir = path.join(deploymentsDir, network.name);

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir);
  }

  // Convert BigInt to string for JSON serialization
  const serializable = {
    ...result,
    constructorArgs: result.constructorArgs.map((arg) =>
      typeof arg === "bigint" ? arg.toString() : arg
    ),
  };

  const filePath = path.join(networkDir, `${result.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(serializable, null, 2));
  console.log(`Deployment saved to: ${filePath}`);
}
