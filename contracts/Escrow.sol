// SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

contract Escrow {
    address public payer;
    address payable public payee;
    address public lawyer;
    uint256 public amount;

    constructor(
        address _payer,
        address payable _payee,
        uint256 _amount
    ) payable {
        payer = _payer;
        payee = _payee;
        lawyer = msg.sender;
        amount = _amount;
    }

    function deposit() public payable {
        require(msg.sender == payer, "Sender must be the payer");
        require(
            address(this).balance <= amount,
            "Cant send more than escrow amount"
        );
    }

    function release() public {
        require(
            address(this).balance == amount,
            "cannot release funds before full amount is sent"
        );
        require(msg.sender == lawyer, "only lawyer can release funds");
        payee.transfer(amount);
    }

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }
}
