import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment } from "./utils";

async function main() {
  printHeader("Strings");
  await printDeployerInfo();

  const { result } = await deploy("Strings");

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
