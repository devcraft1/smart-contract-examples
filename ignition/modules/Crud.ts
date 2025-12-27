import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CrudModule = buildModule("Crud", (m) => {
  const crud = m.contract("Crud");

  return { crud };
});

export default CrudModule;
