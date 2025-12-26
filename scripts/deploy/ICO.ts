import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment } from "./utils";
import { ethers } from "hardhat";

async function main() {
  printHeader("ICO");
  await printDeployerInfo();

  // Constructor args: name, symbol, decimals, totalSupply
  const name = "Example Token";
  const symbol = "EXT";
  const decimals = 18;
  const totalSupply = ethers.parseEther("1000000"); // 1 million tokens

  const { result } = await deploy("ICO", [name, symbol, decimals, totalSupply]);

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
