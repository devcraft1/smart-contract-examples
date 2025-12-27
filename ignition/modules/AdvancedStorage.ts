import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AdvancedStorageModule = buildModule("AdvancedStorage", (m) => {
  const advancedStorage = m.contract("AdvancedStorage");

  return { advancedStorage };
});

export default AdvancedStorageModule;
