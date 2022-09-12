const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const tld = "test";
const ethers = hre.ethers;
const utils = ethers.utils;
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  // TODO: Only for local testing use custom RollupProcessor contract. Remove when deploying on mainnet-fork
  // const RollupProcessor = await ethers.getContractFactory("RollupProcessor")
  const CustomResolver = await ethers.getContractFactory("CustomResolver")
  const signers = await ethers.getSigners()
  const accounts = signers.map(s => s.address)

  // const rollupProcessor = await RollupProcessor.deploy()
  // await rollupProcessor.deployed()

  // TODO: replace rollupProcessor address with the deployed address.
  const resolver = await CustomResolver.deploy(ens.address, ZERO_ADDRESS, ZERO_ADDRESS)
  await resolver.deployed()
  
  await setupResolver(ens, resolver, accounts)
};

async function setupResolver(ens, resolver, accounts) {
  const resolverNode = namehash.hash("resolver")
  
  const setAddr = await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address)
  await setAddr.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });