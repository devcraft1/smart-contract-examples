import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DAOModule = buildModule("DAO", (m) => {
  // Parameters with defaults
  const contributionTime = m.getParameter("contributionTime", 7 * 24 * 60 * 60); // 7 days
  const voteTime = m.getParameter("voteTime", 7 * 24 * 60 * 60); // 7 days
  const quorum = m.getParameter("quorum", 50n); // 50%

  const dao = m.contract("DAO", [contributionTime, voteTime, quorum]);

  return { dao };
});

export default DAOModule;
