import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const EscrowModule = buildModule("Escrow", (m) => {
  // For production, these should be provided as parameters
  const payer = m.getParameter("payer");
  const payee = m.getParameter("payee");
  const lawyer = m.getParameter("lawyer");
  const amount = m.getParameter("amount", parseEther("1"));

  const escrow = m.contract("Escrow", [payer, payee, lawyer, amount]);

  return { escrow };
});

export default EscrowModule;
