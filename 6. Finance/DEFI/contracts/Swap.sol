// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
import "./EmpireToken.sol";

contract Swap{
    string public name = "Awesome swap";
    EmpireToken public rewardTokenInstance;
    uint public rate = 100;

    event TokensPurchase(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(EmpireToken _token) {
        rewardTokenInstance = _token;
    }

    function buyTokens()  public payable{
        require(msg.sender != address(0), "Mauvaise address");
        // Calculate the number of tokens
        uint tokenAmount = msg.value * rate;
        //enough tokens
        require(rewardTokenInstance.balanceOf(address(this)) >= tokenAmount, "pas assez de token");
        rewardTokenInstance.transfer(msg.sender, tokenAmount);

        //Emit an event
        emit TokensPurchase(msg.sender, address(rewardTokenInstance), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public{
        require(_amount <= rewardTokenInstance.balanceOf(msg.sender),"Pas assez de token");
        uint etherAmount = _amount / rate;
        //enough Ether
        require(address(this).balance >= etherAmount, "pas assez d' ether");
        //Perform
        rewardTokenInstance.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer(etherAmount);

        emit TokensSold(msg.sender, address(rewardTokenInstance), _amount, rate);
    }
}