import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EventContractModule = buildModule("EventContract", (m) => {
  const eventContract = m.contract("EventContract");

  return { eventContract };
});

export default EventContractModule;
