import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment } from "./utils";

async function main() {
  printHeader("Lottery");
  await printDeployerInfo();

  // Constructor arg: house fee (2%)
  const houseFee = 2;

  const { result } = await deploy("Lottery", [houseFee]);

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
