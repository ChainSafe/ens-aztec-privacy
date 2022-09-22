require("dotenv").config();
const hre = require("hardhat");
const namehash = require("eth-ens-namehash");

const ethers = hre.ethers;

async function main () {
  const hashOfName = namehash.hash(process.env.ENS_NAME_FOR_PRIVATE_KEY);
  const wallet = await new ethers.Wallet(process.env.PRIVATE_KEY, await ethers.provider)
  // await enablePrivateTx(hashOfName, wallet.address)
  // console.log('enable private done')
  await sendPrivate(hashOfName, await ethers.utils.parseEther("0.001"))
  console.log('Sent!')
}

async function testMethod(hashOfName) {
  const CustomResolver = await ethers.getContractAt("CustomResolver", process.env.GOERLI_CUSTOMRESOLVER_ADDR)
  const addr = await CustomResolver['addr(bytes32)'](hashOfName)
  console.log(addr)
}

async function enablePrivateTx(hashOfName, account) {
  const CustomResolver = await ethers.getContractAt("CustomResolver", process.env.GOERLI_CUSTOMRESOLVER_ADDR)
  const setAddr = await CustomResolver['setAddr(bytes32,address)'](hashOfName, account)
  await setAddr.wait()
  // const setSendPrivate = await CustomResolver.setSendPrivate(hashOfName, true)
  // await setSendPrivate.wait()
}

async function sendPrivate(hashOfName, amount) {
  const CustomResolver = await ethers.getContractAt("CustomResolver", process.env.GOERLI_CUSTOMRESOLVER_ADDR)
  const tx = await CustomResolver['sendPrivate(bytes32)'](hashOfName, {
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