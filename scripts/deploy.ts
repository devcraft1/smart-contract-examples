/**
 * Main deployment script - deploys all contracts
 * For individual contract deployment, use scripts in ./deploy/
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network <network>
 *   npx hardhat run scripts/deploy/Counter.ts --network <network>
 */

import "./deploy/all";
