import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TwitterModule = buildModule("Twitter", (m) => {
  const twitter = m.contract("Twitter");

  return { twitter };
});

export default TwitterModule;
