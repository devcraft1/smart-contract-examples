import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TimelockModule = buildModule("Timelock", (m) => {
  // Get deployer account for owner
  const owner = m.getAccount(0);

  // Duration parameter (default 7 days)
  const duration = m.getParameter("duration", 7 * 24 * 60 * 60);

  const timelock = m.contract("Timelock", [owner, duration]);

  return { timelock };
});

export default TimelockModule;
