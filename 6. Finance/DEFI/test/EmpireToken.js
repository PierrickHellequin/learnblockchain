 const { assert } = require("chai");

const EmpireToken = artifacts.require("EmpireToken");


// Start a test series named EmpireToken, it will use 10 test accounts 
contract("EmpireToken", async accounts => {

    //Test initial namme
    it("initial name", async () => {
        // wait until EmpireToken is deplyoed, store the results inside EmpireToken
        // the result is a client to the Smart contract api
        empireToken = await EmpireToken.deployed();
        // call our name function
        let name = await empireToken.name();
        // Assert that the name matches what we set in migration
        assert.equal(name.toString(), "EmpireToken", "The name is not the same"); 
    });
}); 