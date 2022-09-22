const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;
const namehash = require("eth-ens-namehash");

const labelhash = (label) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000"

describe("CustomResolver", async function () {
  async function deployContracts() {
    const ENS = await ethers.getContractFactory("ENSRegistry")
    ens = await ENS.deploy()
    await ens.deployed()

    const RollupProcessor = await ethers.getContractFactory("RollupProcessor")
    rollupProcessor = await RollupProcessor.deploy(0, 1000000000)
    await rollupProcessor.deployed()

    const CustomResolver = await ethers.getContractFactory("CustomResolver")
    resolver = await CustomResolver.deploy(ens.address, rollupProcessor.address, ZERO_ADDRESS)
    await resolver.deployed()
    
    return {ens, rollupProcessor, resolver}
  };

  it("Should setup the resolver", async function() {
    const {ens, rollupProcessor, resolver} = await loadFixture(deployContracts)
    const resolverLabel = labelhash("resolver")
    const resolverNode = namehash.hash("resolver")
    const [owner, otherAccount] = await ethers.getSigners()
    
    const setSubnodeOwner = await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, owner.address)
    await setSubnodeOwner.wait()

    const setResolver = await ens.setResolver(resolverNode, resolver.address)
    await setResolver.wait()
    
    const setSendPrivate = await resolver.setSendPrivate(resolverNode, true)
    await setSendPrivate.wait()

    const setAddr = await resolver['setAddr(bytes32,address)'](resolverNode, owner.address)
    await setAddr.wait()
  });

  it("Should resolve the name", async function() {
    const {ens, rollupProcessor, resolver} = await loadFixture(deployContracts)
    const addr = await resolver['addr(bytes32)'](namehash.hash('resolver'))
    const [owner, otherAccount] = await ethers.getSigners()
    expect(addr === owner.address)
  });
});