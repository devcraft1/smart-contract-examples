import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment, getDeployerInfo } from "./utils";

async function main() {
  printHeader("Timelock");
  await printDeployerInfo();

  const { deployer } = await getDeployerInfo();

  // Constructor args: owner, duration in seconds (1 week)
  const owner = deployer.address;
  const duration = 7 * 24 * 60 * 60;

  const { result } = await deploy("Timelock", [owner, duration]);

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
