//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract TokenICO is Token {
    address public admin;
    address payable public deposit;
    uint tokenPrice = 0.001 ether; // 1ETH = 1000 PJZV, 1 PJZV = 0.001 ETH
    uint public hardcap = 300 ether; // we cannot raise more than 300 ETH
    uint public raisedAmount;
    uint public saleStart = block.timestamp; // ico starts when deployed
    uint public saleEnd = block.timestamp + 604800; // ico ends in one week
    uint public tokenTradeStart = saleEnd + 604800; // you can trade tokens no sooner than week after sale ends
    uint public maxInvestement = 5 ether;
    uint public minInvestment = 0.1 ether;

    enum State {
        beforeStart,
        running,
        afterEnd,
        halted
    }
    State public icoState;

    constructor(uint _totalSupply, address payable _deposit) Token(_totalSupply) {
        deposit = _deposit;
        admin = msg.sender;
        icoState = State.beforeStart;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    modifier lockUpEnded() {
        require(block.timestamp > tokenTradeStart, "Can't do this before lock up period ends");
        _;
    }

    function halt() public onlyAdmin {
        icoState = State.halted;
    }

    function resume() public onlyAdmin {
        icoState = State.running;
    }

    function changeDepositAddress(address payable newDeposit) public onlyAdmin {
        deposit = newDeposit;
    }

    function getCurrentState() public view returns(State) {
        if (icoState == State.halted) {
            return State.halted;
        } else if (block.timestamp < saleStart) {
            return State.beforeStart;
        } else if (block.timestamp >= saleStart && block.timestamp <= saleEnd) {
            return State.running;
        } else {
            return State.afterEnd;
        }
    }

    event Invest(address invetor, uint value, uint tokens);

    function invest() payable public returns(bool) {
        icoState = getCurrentState();
        require(icoState == State.running, "Initial coin offering is not running");

        require(msg.value >= minInvestment && msg.value <= maxInvestement, "You can't send less than 0.1 ETH and more than 5 ETH");

        uint tokens = msg.value / tokenPrice;
        require(balances[msg.sender] + tokens <= 5000, "Single address can't have more than 5000 PJZV");

        raisedAmount += msg.value;
        require(raisedAmount <= hardcap, "Value would exceed hardcap");

        balances[msg.sender] += tokens;
        balances[owner] -= tokens;
        deposit.transfer(msg.value);

        emit Invest(msg.sender, msg.value, tokens);

        return true;
    }

    receive() payable external {
        invest();
    }

    function transfer(address _to, uint256 _value) public override lockUpEnded returns (bool) {
        Token.transfer(_to, _value); // same as super.transfer(_to, _value)
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public override lockUpEnded returns (bool) {
        Token.transferFrom(_from, _to, _value);
        return true;
    }

    function burn() public returns(bool) {
        // anyone can burn tokens after sale to prevent admin keeping them to himself
        icoState = getCurrentState();
        require(icoState == State.afterEnd, "You can't burn tokens before sale ends");
        balances[owner] = 0;
        return true;
    }
}
