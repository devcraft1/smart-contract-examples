import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StringsModule = buildModule("Strings", (m) => {
  const strings = m.contract("Strings");

  return { strings };
});

export default StringsModule;
