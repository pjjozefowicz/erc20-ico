//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IERC20.sol";

contract Token is IERC20 {
    string public name = "Piotr Jozefowicz Token";
    string public symbol = "PJZV";
    uint public decimals = 18;
    uint public override totalSupply;

    address public founder;
    mapping(address => uint) public balances;

    constructor(uint _totalSupply) {
        totalSupply = _totalSupply;
        founder = msg.sender;
        balances[founder] = totalSupply;
    }

    function balanceOf(address _who) public override view returns (uint256) {
        return balances[_who];
    }

    function transfer(address _to, uint256 _value) public override returns (bool) {
        require(balances[msg.sender] >= _value);
        
        balances[_to] += _value;
        balances[msg.sender] -= _value;
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}