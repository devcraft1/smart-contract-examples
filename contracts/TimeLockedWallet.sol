// SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

contract Timelock {
    uint256 public duration;
    uint256 public immutable end;
    address payable public immutable owner;
    string public status = "Locked";

    constructor(address payable _owner, uint256 _duration) {
        duration = _duration;
        end = block.timestamp + duration;
        owner = _owner;
    }

    event Received(address from, uint256 amount);

    receive() external payable {}

    function deposit() external payable {
        emit Received(msg.sender, msg.value);
    }

    function withdraw() public {
        require(msg.sender == owner, "only owner can withdraw");
        require(block.timestamp >= end, "too early");
        owner.transfer(address(this).balance);
        status = "withdrawn";
    }

    function getBalance() public view returns (uint256) {
        require(msg.sender == owner, "only owner can view this");
        return address(this).balance;
    }
}
