const Token = artifacts.require("EmpireToken");
const Swap = artifacts.require("Swap");
const Stakeable = artifacts.require("./Stakeable.sol");

module.exports = async function (deployer) {
  // Deploy Token
  await deployer.deploy(Token);
  const token = await Token.deployed();

  // Deploy staking
  await deployer.deploy(Stakeable, token.address);
  const stakeable = await Stakeable.deployed();

  // Deploy Swap
  await deployer.deploy(Swap, token.address);
  const swap = await Swap.deployed();

  // Transfer all tokens to EthSwap and stakeable (1 million)
  await token.transfer(stakeable.address, "1000000000000000000000000");
  await token.transfer(swap.address, "1000000000000000000000000");
};
