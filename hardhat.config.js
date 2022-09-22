require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;  

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.10",
    settings: {
      evmVersion: 'london',
      optimizer: { enabled: true, runs: 2000 },
    },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      chainId: 5,
      accounts: [PRIVATE_KEY]
    },
    mainnet_fork: {
      url: `https://mainnet-fork.aztec.network:8545/`,
      chainId: 677868,
      accounts: [PRIVATE_KEY]
    }
  }
};
