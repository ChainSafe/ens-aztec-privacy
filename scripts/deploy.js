const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const ethers = hre.ethers;
const utils = ethers.utils;
const testDomain = "test";
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  await deployCustomResolver()
  /* Uncomment the following only if FIFS is not available in the testnet. Local deployment takes care of it.*/
  // await deployFIFSRegistrar()
};

async function deployRollupProcessor() {
  const RollupProcessor = await ethers.getContractFactory("RollupProcessor")
  const rollupProcessor = await RollupProcessor.deploy(0, 1000000000)
  await rollupProcessor.deployed()
  return rollupProcessor.address
}

async function deployCustomResolver() {
  const chainId = await (await ethers.provider.getNetwork()).chainId
  let resolverNode = namehash.hash("resolver")
  const CustomResolver = await ethers.getContractFactory("CustomResolver")

  if (chainId === 31337) { //localhost
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
    const ens = await ENSRegistry.deploy()
    await ens.deployed()

    const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
    const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash(testDomain))
    await registrar.deployed()
    await setupRegistrar(ens, registrar)

    const rollupProcessorAddr = await deployRollupProcessor()

    const resolver = await CustomResolver.deploy(ens.address, rollupProcessorAddr, ZERO_ADDRESS)
    const tx = await resolver.deployed()
    await tx.deployTransaction.wait()
    await setupResolver(ens, resolver, resolverNode, chainId)
    
  } else if (chainId === 5) { //goerli
    const ens = await ethers.getContractAt("ENSRegistry", process.env.ENS_ADDR)
    // change this to whatever name you already have on goerli
    resolverNode = namehash.hash("jagrooot.eth")
    const resolver = await CustomResolver.deploy(process.env.ENS_ADDR, process.env.GOERLI_ROLLUPPROCESSOR_ADDR, ZERO_ADDRESS)
    const tx = await resolver.deployed()
    await tx.deployTransaction.wait()
    
    await setupResolver(ens, resolver, resolverNode, chainId)
    
  } else if (chainId === 677868) { //mainnet-fork
    ens = await ethers.getContractAt("ENSRegistry", process.env.ENS_ADDR)

    resolver = await CustomResolver.deploy(
      process.env.ENS_ADDR,
      process.env.MAINNET_FORK_ROLLUPPROCESSOR_ADDR,
      ZERO_ADDRESS
    )
    const tx = await resolver.deployed()
    await tx.deployTransaction.wait()
    
    await setupResolver(ens, resolver, resolverNode, chainId)
  }
}

async function setupResolver(ens, resolver, resolverNode, chainId) {
  const resolverLabel = labelhash("resolver");
  const setSubnodeOwner = await ens.setSubnodeOwner(
    chainId === 31337 ? ZERO_HASH : resolverNode,
    resolverLabel,
    await (await ethers.getSigner()).address, {
    gasLimit: 500000
  });
  await setSubnodeOwner.wait()

  const setResolver = await ens.setResolver(resolverNode, resolver.address, {
    gasLimit: 500000
  });
  await setResolver.wait()
  
  const setAddr = await resolver['setAddr(bytes32,address)'](resolverNode, await (await ethers.getSigner()).address)
  await setAddr.wait()
}

async function setupRegistrar(ens, registrar) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash(testDomain), registrar.address, {
    gasLimit: 500000
  });
}

async function deployFIFSRegistrar() {
  const ens = await ethers.getContractAt("ENSRegistry", process.env.ENS_ADDR)
  const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
  const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash(testDomain))
  const tx = await registrar.deployed()
  await tx.deployTransaction.wait()

  await setupRegistrar(ens, registrar)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });