// SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

contract Wallet {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function deposit() public payable {}

    function send(address payable to, uint256 amount) public {
        if (msg.sender == owner) {
            return to.transfer(amount);
        }
        revert("sender not allowed");
    }

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }
}
