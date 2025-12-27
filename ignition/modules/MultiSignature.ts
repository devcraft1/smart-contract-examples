import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiSignatureModule = buildModule("MultiSignature", (m) => {
  // Get deployer as default approver
  const deployer = m.getAccount(0);

  // Parameters - for production, provide actual approvers
  const approvers = m.getParameter("approvers", [deployer]);
  const quorum = m.getParameter("quorum", 1n);

  const wallet = m.contract("contracts/MultiSignature.sol:Wallet", [approvers, quorum]);

  return { wallet };
});

export default MultiSignatureModule;
