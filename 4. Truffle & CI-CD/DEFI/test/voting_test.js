const { BN, ether } = require("@openzeppelin/test-helpers"); //lirairie permettant de faire des tests
const { expect } = require("chai");
const VOT = artifacts.require("Voting");
const truffleAssert = require("truffle-assertions");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Voting", function (accounts) {
  var votingInstance;
  const owner = accounts[0];
  const voter = accounts[1];
  const voter2 = accounts[2];
  const RegisteringVoters = 0;
  const ProposalsRegistrationStarted = 1;

  beforeEach(async function () {
    votingInstance = await VOT.new({ from: owner });
  });

  it("#1 [Failure test] Only owner can change change workflow.", async function () {
    var fakeOwner = voter;
    await truffleAssert.fails(
      votingInstance.voterRegistered(voter2, { from: fakeOwner })
    );
  });

  it("#2 emit save voters", async function () {
    let tx = await votingInstance.voterRegistered(voter);

    truffleAssert.eventEmitted(tx, "VoterRegistered", (ev) => {
      return ev.voterAddress == voter;
    });
  });

  it("#3 should abort with an error save voters in wrong period", async function () {
    await votingInstance.changeWorkflow(ProposalsRegistrationStarted);
    await truffleAssert.reverts(
      votingInstance.voterRegistered(voter),
      "La periode d enregistrement a la whitelist est ferme ! "
    );
  });

  it("#4 user is whilisted", async function () {
    await votingInstance.voterRegistered(voter);
    expect(await votingInstance.isWhitelisted(voter)).to.be.true;
  });

  it("#5 should abort, status is the same", async function () {
    await truffleAssert.reverts(
      votingInstance.changeWorkflow(0),
      "Ce status est deja celui actuel"
    );
  });

  it("#6 emit change workflow", async function () {
    let tx = await votingInstance.changeWorkflow(ProposalsRegistrationStarted);

    truffleAssert.eventEmitted(tx, "WorkflowStatusChange", (ev) => {
      return ev.previousStatus == 0 && ev.newStatus == ProposalsRegistrationStarted;
    });
  });
  
});
