// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract SplitPayment {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function send(address payable[] memory to, uint256[] memory amount)
        public
        payable
        onlyOwner
    {
        require(to.length == amount.length, "to and amount must be equal");
        for (uint256 i = 0; i < to.length; i++) {
            to[i].transfer(amount[i]);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can perform this transaction");
        _;
    }
}
