import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment } from "./utils";

async function main() {
  printHeader("Staking");
  await printDeployerInfo();

  // Note: Staking requires stakingToken and rewardsToken addresses
  // Deploy ERC20 tokens first or use existing ones
  console.log("\nNote: Update with actual token addresses for production");
  console.log("Skipping Staking deployment - requires token addresses");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
