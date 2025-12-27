import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BookAServiceModule = buildModule("BookAService", (m) => {
  const bookAService = m.contract("BookAService");

  return { bookAService };
});

export default BookAServiceModule;
