//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IERC20.sol";

contract Token is IERC20 {
    string public name = "Piotr Jozefowicz Token";
    string public symbol = "PJZV";
    uint public decimals = 0;
    uint public override totalSupply;

    address public owner;
    mapping(address => uint) public balances;

    mapping(address => mapping(address => uint)) public allowed;

    constructor(uint _totalSupply) {
        totalSupply = _totalSupply;
        owner = msg.sender;
        balances[owner] = totalSupply;
    }

    function balanceOf(address _who) public override view returns (uint256) {
        return balances[_who];
    }

    function transfer(address _to, uint256 _value) public virtual override returns (bool) {
        require(balances[msg.sender] >= _value);
        
        balances[_to] += _value;
        balances[msg.sender] -= _value;
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function allowance(address _owner, address _spender) public override view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function approve(address _spender, uint256 _value) public override returns (bool) {
        require(balances[msg.sender] >= _value);
        require(_value > 0);

        allowed[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool) {
        require(allowed[_from][msg.sender] >= _value);
        require(balances[_from] >= _value);
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        balances[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}