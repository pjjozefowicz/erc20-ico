//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract TokenICO is Token (1000000) {
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

    constructor(address payable _deposit) {
        deposit = _deposit;
        admin = msg.sender;
        icoState = State.beforeStart;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier lockUpEnded() {
        require(block.timestamp > tokenTradeStart);
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
        require(icoState == State.running);

        require(msg.value >= minInvestment && msg.value <= maxInvestement);
        raisedAmount += msg.value;
        require(raisedAmount <= hardcap);

        uint tokens = msg.value / tokenPrice;

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
        icoState = getCurrentState();
        require(icoState == State.afterEnd);
        balances[owner] = 0;
        return true;
    }
}
