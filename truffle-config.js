const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const privateKeys = process.env.PRIVATE_KEYS || ""
const MetaMaskAccountIndex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    rinkeby_infura: {
      provider: function() {
          return new HDWalletProvider("hedgehog vivid series onion craft lamp warm beyond congress scorpion axis leopard", "https://rinkeby.infura.io/v3/e231165cabd748bab6b079a9a57c530c", MetaMaskAccountIndex )
      },
      network_id: 4
    }
  },
  compilers: {
    solc: {
      version: "0.6.6"
    }
  }
};
