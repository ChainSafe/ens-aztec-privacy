⚠️ ❌ ❗️❗️DO NOT USE THE DEPLOYED CONTRACTS❗️❗️❌ ⚠️

⚠️ ❌ ❗️❗️NOT PRODUCTION READY❗️❗️❌ ⚠️
# Using Aztec for ENS Privacy

For more details on the scope and description of this proof-of-concept, please refer to the specification [here](https://hackmd.io/@cilOhZOYSdepMrS71Goxqg/BkedGj7Cq). For user manual, see [here](https://hackmd.io/@cilOhZOYSdepMrS71Goxqg/HyamDGkOo).
## Contracts Setup

The contracts are pulled from the [ens-contracts](https://github.com/ensdomains/ens-contracts) and [aztec-connect/blockchain](https://github.com/AztecProtocol/aztec-connect/tree/master/blockchain) repos. 

The Aztec contracts are required to deploy locally or on a testnet not supported by aztec. Aztec currently only supports `mainnet-fork` testnet and there is barely any support to test it out. (Not even a faucet!) The files include:
```
- interfaces/*.sol
- libraries/*.sol
- AztecTypes.sol
- Decoder.sol
- RollupProcessor.sol
```
The ONLY modification that is made in these contracts is in `RollupProcessor.sol`'s constructor() where we default the `rollupState.paused` to be `false`. (Otherwise, several other intricacies would have to be taken care of.)

For ENS contracts, they are inherently available in `ethers.js` library, which we are using via hardhat. The contracts that we modified are:
```
- profiles/*.sol
- ResolverBase.sol
- CustomResolver.sol <- Main contract for our purpose
```
The `CustomResolver` currently only supports Address Resolver, but easily extendable to how the default `PublicResolver` supports other interfaces.

### Contract Deployments

- Mainnet: 
    - CustomResolver: [0x5D597018a815bf3F8aFC8C457d154467cCe25909](https://etherscan.io/address/0x5D597018a815bf3F8aFC8C457d154467cCe25909#code)
    - RollupProcessor: [0xff1f2b4adb9df6fc8eafecdcbf96a2b351680455](https://etherscan.io/address/0xff1f2b4adb9df6fc8eafecdcbf96a2b351680455)
- Goerli:
    - CustomResolver: [0x782b3B841Ce2cA661E6438b42e4ae40F0FAd06c1](https://goerli.etherscan.io/address/0x782b3B841Ce2cA661E6438b42e4ae40F0FAd06c1)
    - RollupProcessor: [0x6Bc2999FB28c8beC3163334E8B7F147CCc21173A](https://goerli.etherscan.io/address/0x6Bc2999FB28c8beC3163334E8B7F147CCc21173A)

## Project Setup

#### Requirements:

- Node.js (^18.8.0)
- Yarn (^1.22.19)

#### Install dependencies:

From the project's root directory, run `yarn`.

#### Environment vars:

Rename `.env.example` to `.env` or create a new `.env` file and insert your own Alchemy API key and Private key for the account that has some Goerli/Mainnet-fork ETH.

#### Run tests:

`yarn:test`
#### Deployment scripts:

1. `yarn deploy:local` <- Before running this make sure to run local node using `yarn start:node`
2. `yarn deploy:goerli` <- Not necessary. Can use the already deployed contracts, addresses available in `.env.example`. This will also update the default resolver contract to the deployed CustomResolver contract for the given private key's primary ENS name. You can simply update the resolver address on `app.ens.domains` instead of running this and updating the new addresses in `.env` file.
3. `yarn deploy:mainnet_fork`

#### Dry Run scripts:

This is mainly to test the `setSendPrivate()` and `sendPrivate()` on testnet. Make sure you already have an ENS name registered for the given private key. Set the name in `.env`. 

1. `yarn dryRun:goerli`
2. `yarn dryRun:mainnet_fork`