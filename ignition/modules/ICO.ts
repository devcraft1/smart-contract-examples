import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ICOModule = buildModule("ICO", (m) => {
  // Token parameters
  const name = m.getParameter("name", "Example Token");
  const symbol = m.getParameter("symbol", "EXT");
  const decimals = m.getParameter("decimals", 18n);
  const totalSupply = m.getParameter("totalSupply", 1_000_000n * 10n ** 18n); // 1 million tokens

  const ico = m.contract("ICO", [name, symbol, decimals, totalSupply]);

  return { ico };
});

export default ICOModule;
