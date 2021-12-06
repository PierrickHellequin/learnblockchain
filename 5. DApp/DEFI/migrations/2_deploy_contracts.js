var Voting = artifacts.require("./Voting.sol");

module.exports = function(deployer, network, accounts) {

  deployer.deploy(Voting);
};
