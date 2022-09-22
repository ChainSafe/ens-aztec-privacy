const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;
const namehash = require("eth-ens-namehash");

const labelhash = (label) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const testDomain = "test"
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

    const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
    const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash(testDomain))
    await registrar.deployed()

    // setup resolver
    const resolverLabel = labelhash("resolver")
    const resolverNode = namehash.hash("resolver")
    const ownerAddr = await (await ethers.getSigner()).address

    await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, ownerAddr)
    await ens.setResolver(resolverNode, resolver.address)
    await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address)

    // setup registrar
    await ens.setSubnodeOwner(ZERO_HASH, labelhash(testDomain), registrar.address)
    
    return {ens, rollupProcessor, resolver, registrar}
  };

  it("Should set and resolve the name", async function() {
    const { resolver, registrar } = await loadFixture(deployContracts)
    const ownerAddr = await (await ethers.getSigner()).address
    const newLabel = labelhash("jagrooot")
    const newNode = namehash.hash("jagrooot.test")
    await registrar.register(newLabel, ownerAddr)
    await resolver['setAddr(bytes32,address)'](newNode, ownerAddr)

    const addr = await resolver['addr(bytes32)'](namehash.hash("jagrooot.test"))
    assert(addr == ownerAddr, "Not equal")
  });

  it("Should send private transaction", async function() {
    const { resolver, registrar, rollupProcessor } = await loadFixture(deployContracts)
    const [owner, anotherAccount] = await ethers.getSigners()

    const newLabel = labelhash("jagrooot")
    const newNode = namehash.hash("jagrooot.test")
    
    await registrar.register(newLabel, owner.address)
    await resolver['setAddr(bytes32,address)'](newNode, owner.address)
    await resolver.setSendPrivate(newNode, true)

    
    await expect(
      await resolver.connect(anotherAccount).sendPrivate(newNode, {
        value: await ethers.utils.parseEther("0.1")
      })
    ).to.emit(resolver, "SendToAztec").withArgs(anotherAccount.address, owner.address, ethers.utils.parseEther("0.1"))
    .to.emit(rollupProcessor, "Deposit").withArgs(0, owner.address, ethers.utils.parseEther("0.1"))
    
  });
});