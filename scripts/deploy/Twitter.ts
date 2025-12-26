import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment } from "./utils";

async function main() {
  printHeader("Twitter");
  await printDeployerInfo();

  const { result } = await deploy("Twitter");

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
