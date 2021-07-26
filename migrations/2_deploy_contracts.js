var BettingGame = artifacts.require("./BettingGame.sol");

module.exports = function(deployer) {
  deployer.deploy(BettingGame);
};
