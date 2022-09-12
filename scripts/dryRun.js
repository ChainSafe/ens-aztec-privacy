require("dotenv").config();
const hre = require("hardhat");
const namehashLib = require("eth-ens-namehash");

const ethers = hre.ethers;
const name = "vitalik.eth";
const namehash = namehashLib.hash(name);

async function main () {
  const wallet = await new ethers.Wallet(process.env.PRIVATE_KEY, await ethers.provider)
  const account = wallet.address

  const ENSRegistry = await ethers.getContractAt("ENSRegistry", process.env.ENS_ADDR)
  console.log(await ENSRegistry.owner(namehash))

  // const tx = await ENSRegistry.setOwner(namehash, account)
  // await tx.wait()
  // console.log(await ENSRegistry.owner(namehash))
}
  
main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
});