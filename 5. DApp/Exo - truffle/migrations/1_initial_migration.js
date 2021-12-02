const Migrations = artifacts.require("Migrations");
const SimpleStorgae = artifacts.require("SimpleStorage");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(SimpleStorage);
};
