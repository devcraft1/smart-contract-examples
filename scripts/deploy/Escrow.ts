
import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment, getDeployerInfo } from "./utils";
import { ethers } from "hardhat";

async function main() {
  printHeader("Escrow");
  await printDeployerInfo();

  const { deployer } = await getDeployerInfo();

  // Constructor args: payer, payee, lawyer, amount
  // For demo, using deployer as all parties - update for production
  const payer = deployer.address;
  const payee = deployer.address;
  const lawyer = deployer.address;
  const amount = ethers.parseEther("1");

  console.log("\nNote: Update constructor args for production deployment");

  const { result } = await deploy("Escrow", [payer, payee, lawyer, amount]);

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
