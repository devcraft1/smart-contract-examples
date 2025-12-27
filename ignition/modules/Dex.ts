import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DexModule = buildModule("Dex", (m) => {
  const dex = m.contract("Dex");

  return { dex };
});

export default DexModule;
