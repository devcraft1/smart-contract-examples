import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TinderModule = buildModule("Tinder", (m) => {
  const tinder = m.contract("Tinder");

  return { tinder };
});

export default TinderModule;
