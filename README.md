# Learning Solidity

A comprehensive repository for learning Solidity development using both **Hardhat** and **Foundry** frameworks. This repository demonstrates professional dual-framework setup with shared learning materials and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Foundry (install from [getfoundry.sh](https://getfoundry.sh/))

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd learning-solidity

# Install Hardhat dependencies
cd hardhat && npm install
cd ..
```

## 📁 Project Structure

```
learning-solidity/
├── hardhat/                  # Hardhat framework setup
│   ├── contracts/            # Solidity contracts (30+ examples)
│   ├── test/                 # Hardhat tests (TypeScript)
│   ├── scripts/              # Deployment scripts
│   ├── hardhat.config.ts     # Hardhat configuration
│   └── package.json          # Hardhat dependencies
├── foundry/                  # Foundry framework setup
│   ├── src/                  # Foundry contracts
│   ├── test/                 # Forge tests (Solidity)
│   ├── script/               # Forge scripts
│   ├── lib/                  # Forge libraries
│   └── foundry.toml          # Foundry configuration
├── .env.example              # Environment variables template
├── .prettierrc               # Code formatting rules
└── package.json              # Root package.json with scripts
```

## 🛠 Development Workflows

### Hardhat Commands
```bash
# From root directory
npm run hardhat:compile      # Compile contracts
npm run hardhat:test         # Run tests
npm run hardhat:coverage     # Test coverage
npm run hardhat:node         # Start local node
npm run hardhat:deploy:local # Deploy locally
npm run hardhat:lint         # Lint contracts
```

### Foundry Commands
```bash
# From root directory
npm run foundry:compile      # Compile contracts
npm run foundry:test         # Run tests
npm run foundry:test:coverage # Test coverage
npm run foundry:deploy:local # Deploy locally
npm run foundry:fmt          # Format code
```

### Cross-Framework Commands
```bash
# Run both frameworks
npm run test:all             # Run all tests
npm run compile:all          # Compile with both frameworks
npm run clean:all            # Clean all build artifacts
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `PRIVATE_KEY`: Deployment private key (never commit actual keys!)
- `ALCHEMY_KEY`: Alchemy API key for RPC connections
- `ETHERSCAN_API_KEY`: For contract verification
- `COINMARKETCAP_API_KEY`: For gas reporting

### Network Configuration
Both frameworks are configured with:
- **localhost**: Local development (port 8545)
- **sepolia**: Ethereum testnet
- **goerli**: Ethereum testnet (legacy)
- **mainnet**: Ethereum mainnet

## 📝 Smart Contracts

The repository includes 30+ example contracts covering:

### Basic Contracts
- **Counter**: Simple counter with increment/decrement
- **Lock**: Time-locked wallet example

### DeFi Contracts
- **Dex**: Decentralized exchange
- **LendingPool**: Lending and borrowing
- **Staking**: Token staking mechanism
- **ICO**: Initial coin offering
- **Vault**: Secure token vault

### Governance & Social
- **DAO**: Decentralized autonomous organization
- **Vote**: Voting mechanism
- **MultiSignature**: Multi-sig wallet
- **Tinder**: Social matching contract
- **Tweet**: Decentralized twitter

### Utility Contracts
- **Escrow**: Secure escrow service
- **Lottery**: Fair lottery system
- **Schedule**: Time-based scheduling
- **Wallet**: Basic wallet functionality

## 🧪 Testing

Both frameworks include comprehensive tests:

### Hardhat Tests (`hardhat/test/`)
- **TypeScript-based** tests with Chai assertions
- **Network helpers** for time manipulation
- **Fixtures** for gas optimization
- **12 passing tests** covering Counter and Lock contracts

### Foundry Tests (`foundry/test/`)
- **Solidity-based** tests with built-in assertions
- **Fuzz testing** capabilities
- **Advanced cheatcodes** for testing
- **3 passing tests** for Counter contract

## 📦 Deployment

### Local Deployment
1. Start a local node:
   ```bash
   npm run hardhat:node
   ```
2. Deploy contracts:
   ```bash
   npm run hardhat:deploy:local
   # or
   npm run foundry:deploy:local
   ```

### Testnet Deployment
1. Configure environment variables
2. Fund your deployment wallet
3. Deploy:
   ```bash
   npm run hardhat:deploy:testnet
   # or
   npm run foundry:deploy:testnet
   ```

## 🏗 Framework Comparison

| Feature | Hardhat | Foundry |
|---------|---------|---------|
| **Language** | TypeScript/JavaScript | Solidity |
| **Speed** | Moderate | Very Fast |
| **Testing** | Mocha/Chai | Forge |
| **Gas Optimization** | Good | Excellent |
| **Debugging** | Excellent | Good |
| **Ecosystem** | Large | Growing |
| **Learning Curve** | Gentle | Steep |

## 🚀 Best Practices

1. **Framework Independence**: Each framework works independently
2. **Environment Variables**: Never commit private keys or sensitive data
3. **Testing**: Both frameworks have comprehensive test suites
4. **Code Formatting**: Use Prettier for consistent formatting
5. **Version Control**: Use semantic versioning and clear commit messages

## 📚 Learning Path

### 1. Start with Hardhat
- User-friendly environment with TypeScript
- Excellent debugging and testing tools
- Large ecosystem and community support
- Great for beginners learning Solidity

### 2. Advanced with Foundry
- High-performance testing and compilation
- Solidity-native testing approach
- Advanced features like fuzz testing
- Better for gas optimization and performance

### 3. Contract Examples
Explore the 30+ contract examples covering:
- Basic Solidity concepts
- DeFi protocols and mechanisms
- Governance and voting systems
- Social and utility contracts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for both frameworks
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Create issues for bugs or feature requests
- Check documentation for common problems
- Join community discussions

---

**Happy Learning! 🎓**

*Explore both Hardhat and Foundry to become a well-rounded Solidity developer.*