import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AllModule = buildModule("All", (m) => {
  // Simple contracts (no constructor args)
  const counter = m.contract("Counter");
  const advancedStorage = m.contract("AdvancedStorage");
  const crud = m.contract("Crud");
  const fibonacci = m.contract("Fibonacci");
  const voting = m.contract("Voting");
  const tinder = m.contract("Tinder");
  const twitter = m.contract("Twitter");
  const dex = m.contract("Dex");
  const bookAService = m.contract("BookAService");
  const eventContract = m.contract("EventContract");
  const strings = m.contract("Strings");

  // DAO with parameters
  const contributionTime = m.getParameter("contributionTime", 7 * 24 * 60 * 60);
  const voteTime = m.getParameter("voteTime", 7 * 24 * 60 * 60);
  const quorum = m.getParameter("quorum", 50n);
  const dao = m.contract("DAO", [contributionTime, voteTime, quorum]);

  // Lottery with house fee
  const houseFee = m.getParameter("houseFee", 2n);
  const lottery = m.contract("Lottery", [houseFee]);

  // ICO with token parameters
  const tokenName = m.getParameter("tokenName", "Example Token");
  const tokenSymbol = m.getParameter("tokenSymbol", "EXT");
  const tokenDecimals = m.getParameter("tokenDecimals", 18n);
  const tokenSupply = m.getParameter("tokenSupply", 1_000_000n * 10n ** 18n);
  const ico = m.contract("ICO", [tokenName, tokenSymbol, tokenDecimals, tokenSupply]);

  // Timelock
  const owner = m.getAccount(0);
  const duration = m.getParameter("duration", 7 * 24 * 60 * 60);
  const timelock = m.contract("Timelock", [owner, duration]);

  return {
    counter,
    advancedStorage,
    crud,
    fibonacci,
    voting,
    tinder,
    twitter,
    dex,
    bookAService,
    eventContract,
    strings,
    dao,
    lottery,
    ico,
    timelock,
  };
});

export default AllModule;
