const helper = require("./helpers/truffleTestHelpers");
const Stakeable = artifacts.require("Stakeable");
const EmpireToken = artifacts.require("EmpireToken");
const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");

function token(n) {
  return web3.utils.toWei(n, "ether");
}

contract("Stakeable", async ([deployer, investor, rewardUser]) => {
  let empiretoken, stakeable;  
  before(async () => {
    empiretoken = await EmpireToken.new();
    stakeable = await Stakeable.new(empiretoken.address);

    await empiretoken.transfer(stakeable.address, token("100000"));
  });

  it("Rejected because less than 0.1 ether", async () => {

    stakeID = await stakeable.stake({ from: investor }).should.be.rejected;
  });

   it("new stakeholder should have increased index", async () => {

    stakeID = await stakeable.stake({ from: investor, value: web3.utils.toWei("10", "ether") });
    // Assert on the emittedevent using truffleassert
    // This will capture the event and inside the event callback we can use assert on the values returned
    truffleAssert.eventEmitted(
      stakeID,
      "Staked",
      (ev) => {
        // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
     
        assert.equal(ev.index, 1, "Stake index was not correct");
        return true;
      },
      "Stake event should have triggered"
    );
  });
 
  it("cant withdraw bigger amount than current stake", async () => {

    // Try withdrawing 200 from first stake
    try {
      await stakeable.withdrawStake(web3.utils.toWei("200"), { from: investor });
    } catch (error) {
      assert.equal(
        error.reason,
        "Staking: Cannot withdraw more than you have staked",
        "Failed to notice a too big withdrawal from stake"
      );
    }
  });

  it("withdraw 10 from a stake", async () => {

    let withdraw_amount = 10;
    // Try withdrawing 10 from first stake
    await stakeable.withdrawStake(web3.utils.toWei("5", "ether"), { from: investor });
    // Grab a new summary to see if the total amount has changed
    let summary = await stakeable.hasStake(investor);
    console.log(summary);
    assert.equal(
      summary.total_amount,
      web3.utils.toWei("5", "ether") ,
      "The total staking amount should be 10"
    );

  });

  it("remove stake if empty", async () => {
    let withdraw_amount = 10;
    // Try withdrawing 10 from first stake AGAIN, this should empty the first stake
    await stakeable.withdrawStake(web3.utils.toWei("5"), { from: investor });
    // Grab a new summary to see if the total amount has changed
    let summary = await stakeable.hasStake(investor);

    assert.equal(
      summary.stakes[0].user,
      "0x0000000000000000000000000000000000000000",
      "Failed to remove stake when it was empty"
    );
  });

  it("calculate rewards", async () => {

    let priceETH = 2700e18; //getLatestPrice();
    let priceEmpireToken = 10e18;
    let amountEmpireToken =  priceETH / priceEmpireToken;
    // Owner has 1 stake at this time, its the index 1 with 10 Tokens staked
    // So lets fast forward time by 20 Hours and see if we gain 2% reward
    await stakeable.stake({ from: investor, value: web3.utils.toWei("10", "ether") });
    const newBlock = await helper.advanceTimeAndBlock(3600 * 20);
    let summary = await stakeable.hasStake(investor);

    let stake = summary.stakes[1];
    assert.equal(
      stake.claimable,
      web3.utils.toWei("10", "ether") * 0.02*amountEmpireToken,
      "Reward should be 0,2 after staking for twenty hours with 10"
    );
    // Make a new Stake for 10, fast forward 20 hours again, and make sure total stake reward is 24 (20+4)
    // Remember that the first 10 has been staked for 40 hours now, so its 4 in rewards.
    await stakeable.stake({ from: investor, value: web3.utils.toWei("10", "ether") });
    await helper.advanceTimeAndBlock(3600 * 20);

    summary = await stakeable.hasStake(investor);

    stake = summary.stakes[1];
    let newstake = summary.stakes[2];

    assert.equal(
      stake.claimable,
      web3.utils.toWei("10", "ether") * 0.04*amountEmpireToken,
      "Reward should be 4 after staking for 40 hours"
    );
    assert.equal(
      newstake.claimable,
      web3.utils.toWei("10", "ether") * 0.02*amountEmpireToken,
      "Reward should be 2 after staking 20 hours"
    );
  });

  it("reward stakes", async () => {
    // Use a fresh Account, Mint 1000 Tokens to it
    //await empireToken.mint(accounts[3], 1000);
    let initial_balance = await empiretoken.balanceOf(rewardUser);
    // Make a stake on 10, fast forward 20 hours, claim reward
    await stakeable.stake({ from: rewardUser, value: web3.utils.toWei("10", "ether") });
    await helper.advanceTimeAndBlock(3600 * 20);

    let stakeSummary = await stakeable.hasStake(rewardUser);
    let stake = stakeSummary.stakes[0];
    // Withdraw 10 from stake at index 0
    await stakeable.withdrawStake(web3.utils.toWei("10", "ether"), { from: rewardUser });

    // Balance of account holder should be updated by 10,4 tokens
    let after_balance = await empiretoken.balanceOf(rewardUser);

    let expected =  Number(stake.claimable);
    assert.equal(
      after_balance.toString(),
      expected,
      "Failed to withdraw the stake correctly"
    );
    
  }); 
});
