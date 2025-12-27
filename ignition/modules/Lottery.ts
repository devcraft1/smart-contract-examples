import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LotteryModule = buildModule("Lottery", (m) => {
  // House fee parameter (default 2%)
  const houseFee = m.getParameter("houseFee", 2n);

  const lottery = m.contract("Lottery", [houseFee]);

  return { lottery };
});

export default LotteryModule;
