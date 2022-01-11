const helper = require("./helpers/truffleTestHelpers");
const EmpireToken = artifacts.require("EmpireToken");
const Swap = artifacts.require("Swap");

require("chai").use(require("chai-as-promised")).should();

function token(n) {
  return web3.utils.toWei(n, "ether");
}

contract("Swap", ([deployer, investor]) => {
  let swap, empiretoken;

  before(async () => {
    empiretoken = await EmpireToken.new();
    swap = await Swap.new(empiretoken.address);

    await empiretoken.transfer(swap.address, token("100000"));
  });

  describe("Swap deployment", async () => {
    it("contract has a name", async () => {
      const name = await swap.name();
      assert.equal(name, "Awesome swap");
    });
  });

  describe("Buy token", async () => {
    let result;

    before(async () => {
      //Purchase token
      result = await swap.buyTokens({
        from: investor,
        value: web3.utils.toWei("1", "ether"),
      });
    });

    it("Buy token to a fixed price", async () => {
      //Check investor balance token
      let investorBalance = await empiretoken.balanceOf(investor);
      assert.equal(investorBalance.toString(), token("100"));

      //Check balance of swap contract after purchase
      let swapBalance = await empiretoken.balanceOf(swap.address);
      assert.equal(swapBalance.toString(), token("99900"));

      let ethSwapBalance = await web3.eth.getBalance(swap.address);
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei("1", "ether"));

      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, empiretoken.address);
      assert.equal(event.amount.toString(), token("100").toString());
      assert.equal(event.rate.toString(), "100");
    });
  });

  describe("Sell token", async () => {
    let result;

    before(async () => {
      await empiretoken.approve(swap.address, token("100"), { from: investor });
      result = await swap.sellTokens(token("100"), { from: investor });
    });

    it("Sell token to a fixed price", async () => {
      let investorBalance = await empiretoken.balanceOf(investor);
      assert.equal(investorBalance.toString(), token("0"));

      //Check balance of swap contract after sell
      let swapBalance = await empiretoken.balanceOf(swap.address);
      assert.equal(swapBalance.toString(), token("100000"));

      let ethSwapBalance = await web3.eth.getBalance(swap.address);
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei("0", "ether"));

      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, empiretoken.address);
      assert.equal(event.amount.toString(), token("100").toString());
      assert.equal(event.rate.toString(), "100");

      // Failure 
      await swap.sellTokens(token("500"), { from: investor }).should.be.rejected;
    });
  });
});
