//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20{
    uint256 totalSupply;
    address _owner;
    uint128 _priceToken = 0.001 ether;
    mapping(address => uint256) private _balances;

    constructor(uint256 _totalSupply) public ERC20("RewardToken", "RT"){
        totalSupply = _totalSupply;
        _owner = msg.sender;

        _mint(msg.sender, _totalSupply);
        _balances[_owner] = _totalSupply;
    }
}