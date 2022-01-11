//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract EmpireToken is ERC20 {

    uint256 public _totalSupply = 2000000000000000000000000;
    address private _owner;

    mapping(address => uint256) private _balances;

    constructor()  ERC20("EmpireToken", "ET") {
        _owner = msg.sender;
        _balances[msg.sender] = _totalSupply;
         _mint(msg.sender, _totalSupply);
        //Add the total supply to the creator of the token
    }

    function mint(uint256 totalSupply) public{
        _mint(msg.sender, totalSupply);
        _balances[msg.sender] = totalSupply;
        _totalSupply = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
}
