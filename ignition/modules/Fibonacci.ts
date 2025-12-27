import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FibonacciModule = buildModule("Fibonacci", (m) => {
  const fibonacci = m.contract("Fibonacci");

  return { fibonacci };
});

export default FibonacciModule;
