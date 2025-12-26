import { deploy, printHeader, printDeployerInfo, printDeploymentResult, saveDeployment } from "./utils";

async function main() {
  printHeader("DAO");
  await printDeployerInfo();

  // Constructor args: contributionTime, voteTime, quorum
  const contributionTime = 7 * 24 * 60 * 60; // 7 days
  const voteTime = 7 * 24 * 60 * 60; // 7 days
  const quorum = 50; // 50%

  const { result } = await deploy("DAO", [contributionTime, voteTime, quorum]);

  printDeploymentResult(result);
  await saveDeployment(result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
