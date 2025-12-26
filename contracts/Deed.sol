// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Deed {
    address payable lawyer;
    address payable beneficiary;
    uint256 earliest;

    constructor(
        address payable _lawyer,
        address payable _beneficiary,
        uint256 _fromNow
    ) payable {
        lawyer = _lawyer;
        beneficiary = _beneficiary;
        earliest = block.timestamp + _fromNow;
    }

    function withdraw() public payable {
        require(msg.sender == lawyer, "lawyer only");
        require(block.timestamp >= earliest, "too early");
        beneficiary.transfer(address(this).balance);
    }
}
