const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const ethers = hre.ethers;
const utils = ethers.utils;
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  // Enable deploy rollup only if required locally. Goerli and mainnet-fork addresses available in env.
  // await deployRollupProcessor()
  await deployCustomResolver()
};

async function deployRollupProcessor() {
  const RollupProcessor = await ethers.getContractFactory("RollupProcessor")
  const rollupProcessor = await RollupProcessor.deploy(0, 1000000000)
  await rollupProcessor.deployed()
}

async function deployCustomResolver() {
  const chainId = await (await ethers.provider.getNetwork()).chainId
  console.log(chainId)
  const CustomResolver = await ethers.getContractFactory("CustomResolver")

  if (chainId === 31337) { //localhost
    const signer = await ethers.getSigner();
    const resolverNode = namehash.hash("resolver")
    const account = signer.address

    const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
    const ens = await ENSRegistry.deploy()
    await ens.deployed()

    const resolver = await CustomResolver.deploy(ens.address, ZERO_ADDRESS, ZERO_ADDRESS)
    const tx = await resolver.deployed()
    await tx.deployTransaction.wait()
    
    await setupResolver(ens, resolver, resolverNode, account, chainId)
    
  } else if (chainId === 5) { //goerli
    const wallet = await new ethers.Wallet(process.env.PRIVATE_KEY, await ethers.provider)
    const resolverNode = namehash.hash(process.env.ENS_NAME_FOR_PRIVATE_KEY)
    const account = wallet.address
    const ens = await ethers.getContractAt("ENSRegistry", process.env.ENS_ADDR)

    const resolver = await CustomResolver.deploy(process.env.ENS_ADDR, process.env.GOERLI_ROLLUPPROCESSOR_ADDR, ZERO_ADDRESS)
    const tx = await resolver.deployed()
    await tx.deployTransaction.wait()
    
    await setupResolver(ens, resolver, resolverNode, account, chainId)
    
  } else if (chainId === 677868) { //mainnet-fork
    const wallet = await new ethers.Wallet(process.env.PRIVATE_KEY, await ethers.provider)
    const resolverNode = namehash.hash(process.env.ENS_NAME_FOR_PRIVATE_KEY)
    account = wallet.address
    ens = await ethers.getContractAt("ENSRegistry", process.env.ENS_ADDR)

    resolver = await CustomResolver.deploy(
      process.env.ENS_ADDR,
      process.env.MAINNET_FORK_ROLLUPPROCESSOR_ADDR,
      ZERO_ADDRESS
    )
    const tx = await resolver.deployed()
    await tx.deployTransaction.wait()
    
    await setupResolver(ens, resolver, resolverNode, account, chainId)
  }
}

async function setupResolver(ens, resolver, resolverNode, account, chainId) {
  const resolverLabel = labelhash("resolver");
  const setSubnodeOwner = await ens.setSubnodeOwner(
    chainId === 31337 ? ZERO_HASH : resolverNode,
    resolverLabel,
    account, {
    gasLimit: 500000
  });
  await setSubnodeOwner.wait()

  const setResolver = await ens.setResolver(resolverNode, resolver.address, {
    gasLimit: 500000
  });
  await setResolver.wait()
  
  const setAddr = await resolver['setAddr(bytes32,address)'](resolverNode, account)
  await setAddr.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });