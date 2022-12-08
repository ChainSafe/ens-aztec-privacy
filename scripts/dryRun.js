require("dotenv").config();
const hre = require("hardhat");
const ethers = hre.ethers;
const namehash = require("eth-ens-namehash");

// only for mainnet
async function main () {
  const node = namehash.hash(process.env.ENS_NAME_FOR_PRIVATE_KEY);
  await enablePrivateTx(node)
  // uncomment run separately from owner account
  // await sendPrivate(node, ethers.utils.parseEther("0.001"))
  console.log('Sent to: ', process.env.ENS_NAME_FOR_PRIVATE_KEY);
}

async function enablePrivateTx(node) {
  const CustomResolver = await ethers.getContractAt("CustomResolver", process.env.MAINNET_CUSTOMRESOLVER_ADDR)
  const setSendPrivate = await CustomResolver.setSendPrivate(node, true)
  await setSendPrivate.wait()
}

async function sendPrivate(node, amount) {
  const CustomResolver = await ethers.getContractAt("CustomResolver", process.env.MAINNET_CUSTOMRESOLVER_ADDR)
  const tx = await CustomResolver.sendPrivate(node, {
    value: amount
  })
  await tx.wait()
}
  
main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
});