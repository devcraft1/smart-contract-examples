# Smart Contract Examples

A collection of Solidity smart contract examples covering DeFi, DAOs, NFTs, and common patterns. Each contract includes comprehensive tests.

## Contracts

| Contract | Description |
|----------|-------------|
| **DeFi** |
| `Dex.sol` | Decentralized exchange with limit/market orders |
| `LendingPool.sol` | Lending and borrowing with interest |
| `Staking.sol` | Token staking with rewards |
| `Vault.sol` | ERC20 vault with share-based deposits |
| `ICO.sol` | Initial Coin Offering implementation |
| **Governance** |
| `DAO.sol` | Decentralized Autonomous Organization |
| `Vote.sol` | Ballot-based voting system |
| `MultiSignature.sol` | Multi-sig wallet with quorum |
| **Utilities** |
| `Escrow.sol` | Three-party escrow service |
| `Wallet.sol` | Simple ETH wallet |
| `SplitPayment.sol` | Split payments to multiple recipients |
| `TimeLockedWallet.sol` | Time-locked withdrawals |
| **Time-Based** |
| `Deed.sol` | Time-locked inheritance |
| `Multi-Deed.sol` | Multi-payout inheritance |
| `Lock.sol` | Token lock with unlock time |
| `Loan-machine.sol` | State machine for loans |
| **Social** |
| `Tinder.sol` | Matching and messaging dApp |
| `Tweet.sol` | Twitter-like social contract |
| **Events & Tickets** |
| `Events.sol` | Event creation and ticket sales |
| `Lottery.sol` | Lottery with random winner selection |
| `BookAService.sol` | Service booking system |
| **Data Structures** |
| `AdvancedStorage.sol` | Dynamic array storage |
| `Crud.sol` | Create, Read, Update, Delete operations |
| `User.sol` | User management |
| `Schedule.sol` | State-based scheduling |
| **Algorithms** |
| `Fibonacci.sol` | Fibonacci sequence |
| `StringManipulation.sol` | String operations |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

## Project Structure

```
├── contracts/          # Solidity smart contracts
│   └── mocks/          # Mock contracts for testing
├── test/               # Test files
├── scripts/            # Deployment scripts
├── SECURITY_REPORT.md  # Security audit findings
└── hardhat.config.ts   # Hardhat configuration
```

## Security

This repository includes a security audit. See [SECURITY_REPORT.md](./SECURITY_REPORT.md) for documented vulnerabilities and recommendations.

**Note:** These contracts are for educational purposes. Do not use in production without proper auditing.

## Tech Stack

- Solidity ^0.8.19
- Hardhat
- TypeScript
- Chai + Mocha
- OpenZeppelin Contracts

## License

ISC
